import torch
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
# NET_DIC_PATH = NET_DIR + "net_dict.json"
RESULTS_DIR = "/box/" if IS_SAND_BOX else ROOT_DIR


def get_net(prop):
    m_hidden_layers = int(prop[1])
    n_nodes = int(prop[2])
    net_class = prop[0]
    net_class = eval(net_class)
    net = net_class([28**2] + [n_nodes for i in range(m_hidden_layers)] +[10])
    net_path = NET_DIR + net.name + 'model.pth'
    net.load_state_dict(torch.load(net_path))
    return net

def save_results(results):
    with open(RESULTS_DIR + "results.json", "w") as f:
        json.dump(results, f)
        # print(RESULTS_DIR + "results.json")s

def train_nn(network, output):
    return

def main(args, algo, net_props, data):
    executor = DeepPenExecutor(args, algo)
    
    for prop in net_props:
        net = get_net(prop)
        executor.execute(net, data)
    results = executor.all_stats
    save_results(results) 
    

if __name__ == "__main__":
    args = {}
    dims = zip(range(2,6),[128,256,512,1024])
    net_props = [('MNIST_FFNN', dim[0], dim[1]) for dim in dims]
    n_test_data = 5

    if IS_SAND_BOX:
        configs =json.load(sys.stdin)
        net_props = eval(configs.get('nn_configs',[]))
        n_test_data= eval(configs.get('data_configs', []))
        n_test_data=int(n_test_data)
    algo = Solution()
    data = MNIST.get_test_data(n_test_data)
    
    main(args, algo, net_props, data)

