import torch
import tensorflow as tf
import sys, os
import json

IS_SAND_BOX = False if os.environ.get("SAND_BOX", None) == None else True
if IS_SAND_BOX:
    sys.path.append("/api/assets")

from DeepPenExecutor import DeepPenExecutor
from DeepPenNetTrainer import DeepPenNetTrainer
from DeepPenAlgorithm import DeepPenAlgorithm
from DeepPenData import MNIST
from DeepPenNNs import *
from algorithm import Solution

ROOT_DIR = "/api/assets/" if IS_SAND_BOX else "./"
NET_DIR = ROOT_DIR + "networks/"
RESULTS_DIR = "/box/" if IS_SAND_BOX else ROOT_DIR


def get_net(prop, framework="torch"):
    m_hidden_layers = int(prop[1])
    n_nodes = int(prop[2])
    net_class = prop[0]
    net=None
    if framework=="torch":
        net_class = eval(net_class)
        net = net_class([28**2] + [n_nodes for i in range(m_hidden_layers)] +[10])
        net_path = NET_DIR + net.name + 'model.pth'
        net.load_state_dict(torch.load(net_path))
        net.eval()
    else:
        net = tf.keras.models.load_model(f'{NET_DIR}tf/{net_class}_{m_hidden_layers}_{n_nodes}.pb')
        class TF_Wrapper(type(net)):
            def name(self, name):
                self.name=name
            def __call__(self, input):
                return  self.predict(input)
            def predict(self, input):
                ret = super().__call__(input=input)
                return  [ret[key] for key in ret.keys()][0]

        net.__class__=TF_Wrapper
        net.name=f'{net_class}_{m_hidden_layers}_{n_nodes}'
    return net

def save_results(results):
    with open(RESULTS_DIR + "results.json", "w") as f:
        json.dump(results, f)

def main(args, 
         algo, 
         net_props, 
         transfer_nets_props,
         data, 
         framework):
    
    x,y = iter(data).next()
    executor = DeepPenExecutor(args, algo, framework=framework)

    #warm up 
    for prop in net_props:
        net = get_net(prop, framework=framework)
        std_res = executor.run_standard(net, x[[0]], y[[0]])
    algo.counter=0
    algo.custom_stats=[]

    all_stats = {}
    for prop in net_props:
        net = get_net(prop, framework=framework)
        std_res = executor.run_standard(net, x, y)
        
        trans_res_all={}
        for trans_prop in transfer_nets_props:
            trans_net = get_net(trans_prop, framework=framework)
            trans_res = executor.run_transfer(trans_net, x,y , std_res["adv"])
            
            counter=0
            suffix=""
            while all_stats.get(trans_net.name+suffix, None) != None:
                suffix=f"_{counter}"
            counter+=1
            trans_res_all[trans_net.name + suffix]=trans_res["stats"]
        
        std_res["trans_res"]=trans_res_all
        std_res["adv"]=std_res["adv"].flatten(1).tolist()
        
        counter=0
        suffix=""
        while all_stats.get(net.name+suffix, None) != None:
            suffix=f"_{counter}"
            counter+=1
        all_stats[net.name+suffix]=std_res

    save_results({
        "data": {
            "indicies": args["indicies"],
            "y": y.tolist(),
            "x": x.flatten(1).tolist()
        },
        "results":all_stats
    }) 
    
if __name__ == "__main__":
    framework = sys.argv[1]
    dims = zip(range(2,6),[128,256,512,1024])
    net_props = [('MNIST_CNN', dim[0], dim[1]) for dim in dims]
    # transfer_nets_props=[('MNIST_FFNN',1,64),('MNIST_FFNN',1,1024),('MNIST_FFNN',5,64),('MNIST_FFNN',5,1024)]
    transfer_nets_props = net_props
    n_test_data = 20
    data_configs={
        "random": "1",
        "indices":"[1,2,4,5,6,7,8,9,10]",
        "n_test_data":10
    }
    
    if IS_SAND_BOX:
        configs =json.load(sys.stdin)
        net_props = eval(configs.get('nn_configs',[]))
        data_configs= eval(configs.get('data_configs', []))
        transfer_nets_props=eval(configs.get('transfer_nn_configs',[]))
    
    data=[]
    indices=[]
    if int(data_configs["random"]) == 1:
        n_test_data=int(data_configs['n_test_data'])
        data,indices = MNIST.get_random_test_data(n_test_data)
    else:
        indices = eval(data_configs["indices"])
        data=MNIST.get_subset_test_data(indices, len(indices))
    algo = Solution()
    
    args = {
        "indicies":indices
    }
    main(args, algo, net_props, transfer_nets_props, data, framework)

