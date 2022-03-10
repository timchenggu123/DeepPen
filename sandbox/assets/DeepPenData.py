from xml.dom import InvalidModificationErr
from numpy import indices
from sklearn.utils import shuffle
import torchvision
import os
from torch.utils.data import DataLoader, Subset
from random import sample

def check_directory(path):
    if not os.path.isdir(path):
        os.makedirs(path)

class MNIST():
    @staticmethod
    def get_train_data(batch_size=64, save_path = './data/MNIST/'):
        check_directory(save_path)
        train_loader = DataLoader(
            torchvision.datasets.MNIST(save_path, train=True, download=True,
                                        transform=torchvision.transforms.Compose([
                                        torchvision.transforms.ToTensor()
                                        # ,
                                        # torchvision.transforms.Normalize(
                                        #     (0.1307,), (0.3081,))
                                        ])),
            batch_size=batch_size, shuffle=True
        )
        return train_loader

    @staticmethod
    def get_random_test_data(n_test_data = 1000, save_path = './data/MNIST/'):
        check_directory(save_path)
        test_set = torchvision.datasets.MNIST(save_path, train=False, download=True,
                                        transform=torchvision.transforms.Compose([
                                        torchvision.transforms.ToTensor()
                                        # ,
                                        # torchvision.transforms.Normalize(
                                        #     (0.1307,), (0.3081,))
                                        ]))
        indices = sample(range(test_set.data.shape[0]),n_test_data)
        subset = Subset(test_set, indices)
        test_loader = DataLoader(
            subset,
            batch_size=n_test_data, shuffle=False)
        return test_loader, indices
    
    @staticmethod
    def get_subset_test_data(indices, batch_size = 1000, save_path = './data/MNIST/'):
        check_directory(save_path)
        test_set = torchvision.datasets.MNIST(save_path, train=False, download=True,
                                        transform=torchvision.transforms.Compose([
                                        torchvision.transforms.ToTensor()
                                        # ,
                                        # torchvision.transforms.Normalize(
                                        #     (0.1307,), (0.3081,))
                                        ]))
        subset = Subset(test_set, indices)
        test_loader = DataLoader(
            subset,
            batch_size=batch_size, shuffle=False)
        return test_loader

    @staticmethod
    def get_test_data(batch_size = 1000, save_path = './data/MNIST/'):
        check_directory(save_path)
        test_set = torchvision.datasets.MNIST(save_path, train=False, download=True,
                                        transform=torchvision.transforms.Compose([
                                        torchvision.transforms.ToTensor()
                                        # ,
                                        # torchvision.transforms.Normalize(
                                        #     (0.1307,), (0.3081,))
                                        ]))
        test_loader = DataLoader(
            test_set,
            batch_size=batch_size, shuffle=True)
        return test_loader