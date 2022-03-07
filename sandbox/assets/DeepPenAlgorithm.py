import torch
import cleverhans
import sys

class DeepPenAlgorithm():
    def __init__(self):
        self.counter=0
        
    def run_algorithm(self, net, data):
        raise NotImplementedError

    