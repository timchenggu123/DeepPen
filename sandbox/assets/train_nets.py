from statistics import mode
import torch
import pickle
import os
from DeepPenNNs import *
from DeepPenNetTrainer import DeepPenNetTrainer
from DeepPenData import MNIST
# from deeprobust.image.defense.TherEncoding import Thermometer
# from deeprobust.image.defense.pgdtraining import PGDtraining
# from deeprobust.image.config import defense_params
# from deeprobust.image.defense.fgsmtraining import FGSMtraining
# from deeprobust.image.config import defense_params

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
def train(model_class, m_hidden, n_nodes):

    if not os.path.isdir("./networks"):
        os.makedirs('./networks')

    model_class=eval(model_class)
    for m in m_hidden:
        for n in n_nodes:
            model = model_class([28**2] + [n for i in range(m)] +[10])
            # optim = torch.optim.SGD(model.parameters(), lr=1e-2, momentum=0.5)
            optim = torch.optim.Adam(model.parameters(), lr=1e-5)

            print(f"Training modelwork {model_class} m_layers: {m} n_nodes: {n}\n")
            trainer = DeepPenNetTrainer(model, optim, MNIST.get_train_data(), 
                            MNIST.get_test_data(),device=DEVICE, verbose=True)
            trainer.run(verbose=True, threshold = 0.95,max_epochs=50)

def test(model_class, m_hidden, n_nodes):

    if not os.path.isdir("./networks"):
        os.makedirs('./networks')

    model_class=eval(model_class)
    for m in m_hidden:
        for n in n_nodes:
            model = model_class([28**2] + [n for i in range(m)] +[10])
            # optim = torch.optim.SGD(model.parameters(), lr=1e-2, momentum=0.5)
            model.load_state_dict(torch.load(f"./networks/{model.name}model.pth"))
            print(f"Testing model {model_class} m_layers: {m} n_nodes: {n}\n")
            trainer = DeepPenNetTrainer(model, None, MNIST.get_train_data(), MNIST.get_test_data(),device=DEVICE, verbose=True)
            trainer.test()
            trainer.save()

# def train_defense(model_class, m_hidden, n_nodes):

#     if not os.path.isdir("./networks"):
#         os.makedirs('./networks')

#     model_class=eval(model_class)
#     for m in m_hidden:
#         for n in n_nodes:
#             model = model_class([28**2] + [n for i in range(m)] +[10])
#             # optim = torch.optim.SGD(model.parameters(), lr=1e-2, momentum=0.5)
#             model.load_state_dict(torch.load(f"./networks/{model.name}model.pth"))
#             print(f"Training model {model_class} m_layers: {m} n_nodes: {n}\n")
#             defense = FGSMtraining(model, 'cpu')
#             defense.generate(MNIST.get_train_data(),MNIST.get_test_data(), 
#                 save_dir="networks/adv", save_name=f"FGSM_{model.name}", 
#                 epoch_num=20, epsilon=0.05, lr_train = 0.005)
# def train_defense(model):
#     defense = Thermometer(model,[1])
#     defense.generate(MNIST.get_train_data(),MNIST.get_test_data(), **defense_params["Thermometer_MNIST"])
#     return model

def main():
    model_class= 'MNIST_CNN'
    m_hidden = range(1,6)
    # n_nodes = [64, 128,256,512,1024]
    n_nodes = [128,256,512,1024]
    # train(model_class, m_hidden, n_nodes)
    # train_defense(model_class, m_hidden, n_nodes)
    test(model_class, m_hidden, n_nodes)

if __name__=='__main__':
    main()