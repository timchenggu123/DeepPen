from statistics import mode
import torch
import pickle
import os
from DeepPenNNs import *
from DeepPenNetTrainer import DeepPenNetTrainer
from DeepPenData import MNIST
from deeprobust.image.defense.TherEncoding import Thermometer
from deeprobust.image.defense.pgdtraining import PGDtraining
from deeprobust.image.config import defense_params

def train(model_class, m_hidden, n_nodes):
    N_EPOCHS = 5

    if not os.path.isdir("./networks"):
        os.makedirs('./networks')

    model_class=eval(model_class)
    for m in m_hidden:
        for n in n_nodes:
            model = model_class([28**2] + [n for i in range(m)] +[10])
            # optim = torch.optim.SGD(model.parameters(), lr=1e-2, momentum=0.5)
            optim = torch.optim.Adam(model.parameters(), lr=1e-5)

            print(f"Training modelwork {model_class} m_layers: {m} n_nodes: {n}\n")
            trainer = DeepPenNetTrainer(model, optim, MNIST.get_train_data(), MNIST.get_test_data())
            trainer.run(verbose=True, threshold = 0.90)

def train_defense(model):
    defense = Thermometer(model,[1])
    defense.generate(MNIST.get_train_data(),MNIST.get_test_data(), **defense_params["Thermometer_MNIST"])
    return model

def main():
    model_class= 'MNIST_CNN'
    m_hidden = range(1,5)
    n_nodes = [64, 128,256,512,1024]
    train(model_class, m_hidden, n_nodes)
    # train_defense()
if __name__=='__main__':
    main()