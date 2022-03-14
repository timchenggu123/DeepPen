import torch
import numpy as np
import torch.nn as nn
import torch.nn.functional as F

class MNIST_FFNN(nn.Module):
    """
    A simple Feed Forward Neural Network with ReLU activation function.
    """
    def __init__(self, layer_shape = [], dropout=0.1):
        super(MNIST_FFNN, self).__init__()
        self.name="MNIST_FFNN_" + str(len(layer_shape)-2) + "_" + str(layer_shape[1])
        self.id = hash(self)
        self.layers = []
        for i,_ in enumerate(layer_shape):
            if i == 0:
                continue
            else:
                self.layers.append(
                    nn.Sequential(
                        nn.Linear(int(layer_shape[i-1]), int(layer_shape[i])),
                        nn.ReLU(),
                        nn.Dropout(0.1)
                        )
                    )
        self.init()
        self.net = nn.Sequential(*self.layers)

    def forward(self, x: torch.Tensor):
        """ overrides the __call__ method of the discriminator """
        x = x.view(x.shape[0], -1)
        x = self.net(x)
        x = F.log_softmax(x, dim=1)
        return x
    
    def init(self):
        for stack in self.layers:
            for layer in stack.children():
                if type(layer) == nn.Linear:
                    nn.init.kaiming_normal_(layer.weight)


class MNIST_CNN(nn.Module):
    """
    A simple Convoluted Neural Network with ReLU activation function.
    """
    def __init__(self, layer_shape = [], dropout=0.1):
        super(MNIST_CNN, self).__init__()
        self.name="MNIST_CNN_" + str(len(layer_shape)-2) + "_" + str(layer_shape[1])
        self.id = hash(self)
        self.conv_layers = []
        self.conv_layers.append(nn.Sequential(         
            nn.Conv2d(
                in_channels=1,              
                out_channels=16,            
                kernel_size=5,              
                stride=1,                   
                padding=2,                  
            ),                              
            nn.ReLU(),                      
            nn.MaxPool2d(kernel_size=2),    
        ))
        self.conv_layers.append(nn.Sequential(         
                nn.Conv2d(16, 32, 5),     
                nn.ReLU(),                      
                nn.MaxPool2d(2),                
        ))

        self.layers=[]
        layer_shape[0]=800
        for i,_ in enumerate(layer_shape):
            if i == 0:
                continue
            else:
                self.layers.append(
                    nn.Sequential(
                        nn.Linear(int(layer_shape[i-1]), int(layer_shape[i])),
                        nn.ReLU(),
                        nn.Dropout(0.1)
                        )
                    )
        self.init()
        self.conv_net = nn.Sequential(*self.conv_layers)
        self.net = nn.Sequential(*self.layers)

    def forward(self, x: torch.Tensor):
        """ overrides the __call__ method of the discriminator """
        x = self.conv_net(x)
        x = x.view(x.shape[0], -1)
        x = self.net(x)
        x = F.log_softmax(x, dim=1)
        return x
    
    def init(self):
        for stack in self.layers:
            for layer in stack.children():
                if type(layer) == nn.Linear:
                    nn.init.kaiming_normal_(layer.weight)

class FGSMMNIST_FFNN(MNIST_FFNN):
    def __init__(self, layer_shape = [], dropout=0.1):
        super().__init__(layer_shape, dropout)
        self.name=self.name="FGSMMNIST_FFNN_" + str(len(layer_shape)-2) + "_" + str(layer_shape[1])

class FGSMMNIST_CNN(MNIST_CNN):
    def __init__(self, layer_shape = [], dropout=0.1):
        super().__init__(layer_shape, dropout)
        self.name=self.name="FGSMMNIST_CNN_" + str(len(layer_shape)-2) + "_" + str(layer_shape[1])