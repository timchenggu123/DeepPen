import torch
import cleverhans
import sys

class DeepPenAlgorithm():
    def __init__(self):
        self.counter=0
        self.custom_stats=[]
        self.data_ids=[]
    
    def append_custom_stats(self, name:str, type:str, data:float):
        '''
        name: name of the score you want to add (will be dislpayed)
        type: the type of the score chart (line chart, bar chart)
        data: a float value.
        '''
        self.custom_stats.append({"name":name, "type":type, "data":data})

    def run_algorithm(self, net, data):
        raise NotImplementedError

    