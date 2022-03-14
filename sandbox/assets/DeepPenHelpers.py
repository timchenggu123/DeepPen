import os
import torch
import tensorflow as tf
import onnx
from onnx_tf.backend import prepare
from DeepPenNNs import *
from DeepPenData import MNIST

NETWORKS_PATH="./networks/"
ONNX_PATH="./networks/onnx/"
TF_PATH="./networks/tf/"

def pth2onnx(filename):
    prop=filename.replace("model.pth", "").split("_")
    m_hidden_layers = int(prop[2])
    n_nodes = int(prop[3])
    net_class = "_".join(prop[0:2])
    net_class = eval(net_class)
    model = net_class([28**2] + [n_nodes for i in range(m_hidden_layers)] +[10])
    net_path = os.path.join(NETWORKS_PATH, filename)
    model.load_state_dict(torch.load(net_path))
    
    dummy_input = torch.autograd.Variable(torch.randn(1, 1, 28, 28))
    dynamic_axes = {'input' : {0 : 'batch_size'}, 
                    'output':{0 : 'batch_size'}}
    torch.onnx.export(model, dummy_input,
                    ONNX_PATH + filename.replace("model.pth", ".onnx"), 
                    input_names=["input"],
                    output_names = ['output'],
                    dynamic_axes=dynamic_axes)
    return filename.replace("model.pth", ".onnx")

def onnx2tf(filename):
    onnx_path = os.path.join(ONNX_PATH, filename)
    model = onnx.load(onnx_path)
    tf_rep = prepare(model)
    tf_path = TF_PATH + filename.replace(".onnx", ".pb")
    tf_rep.export_graph(tf_path)
    return filename.replace(".onnx", ".pb")

# def train_defense(filename):
#     prop=filename.replace("model.pth", "").split("_")
#     m_hidden_layers = int(prop[2])
#     n_nodes = int(prop[3])
#     net_class = "_".join(prop[0:2])
#     net_class = eval(net_class)
#     model = net_class([28**2] + [n_nodes for i in range(m_hidden_layers)] +[10])
#     net_path = os.path.join(NETWORKS_PATH, filename)
#     model.load_state_dict(torch.load(net_path))
#     defense = FGSMtraining(model, 'cpu')
#     defense.generate(MNIST.get_train_data(),MNIST.get_test_data(), 
#             save_dir=f"{NETWORKS_PATH}/adv", save_name=f"FGSM_{model.name}", 
#             epoch_num=20, epsilon=0.05, lr_train = 0.005)
#     return 

def main():
    for filename in os.listdir(NETWORKS_PATH):
        ext = os.path.splitext(filename)[1]
        if ext == ".pth" and filename.startswith('MNIST_FFNN'):
            print(filename)
            # model = train_defense(filename)
            onnx_filename = pth2onnx(filename)
            onnx_filename = filename.replace("model.pth", ".onnx")
            tf_filename = onnx2tf(onnx_filename)
            
if __name__=="__main__":
    main()