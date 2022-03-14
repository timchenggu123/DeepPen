import dataclasses
from hashlib import algorithms_available
from ssl import ALERT_DESCRIPTION_CERTIFICATE_UNOBTAINABLE
import numpy as np
from time import time
from DeepPenAlgorithm import DeepPenAlgorithm
from torch.utils.data import DataLoader
import torch

class DeepPenExecutor():
    def __init__(self, args, algorithm: DeepPenAlgorithm, framework="torch"):
        self.args = args
        self.dataloaders = []
        self.algorithm = algorithm
        self.framework=framework

    def net_inference(self, net, data):
        if self.framework=="torch":
            return net(data)
        else:
            data=data.detach().cpu().numpy()
            res = net(data)
            return torch.tensor(res.numpy())

    def run_user_algorithm(self,algo:DeepPenAlgorithm, net, x, y):
        if self.framework=="torch":
            algo.counter+=1
            return algo.run_algorithm(net, x, y)
        else:
            algo.counter+=1
            x=np.asarray(x.detach().cpu().numpy(), dtype=np.float32)
            y=np.asarray(y.detach().cpu().numpy(), dtype=np.float32)
            return torch.Tensor(algo.run_algorithm(net, x, y).numpy())
         
    def run_standard(self, net, x,y):
        algorithm = self.algorithm
        stats = {}
        results={}
        data = {}
            
        start_time = time()
        x_adv = self.run_user_algorithm(algorithm,net,x,y)
        end_time = time()

        y_pred_val, y_pred_ind = self.net_inference(net, x).max(1)  # model prediction on clean examples
        y_pred_val_adv, y_pred_ind_adv =self.net_inference(net, x_adv).max(1)  # model prediction on adversarial examples

        x_sim = self.calculate_image_similarity(x, x_adv)

        self.stats_agg(results, "y_pred_ind", y_pred_ind.detach().cpu().numpy())
        self.stats_agg(results, "y_pred_ind_adv", y_pred_ind_adv.detach().cpu().numpy())
        self.stats_agg(results, "y_pred_val_", y_pred_val.detach().cpu().numpy())
        self.stats_agg(results, "y_pred_val_adv", y_pred_val_adv.detach().cpu().numpy())
        self.stats_agg(results, "x_sim", x_sim.detach().cpu().numpy())

        accuracy = y_pred_ind[y_pred_ind==y].shape[0]/y.shape[0]
        accuracy_adv = y_pred_ind_adv[y_pred_ind_adv==y].shape[0]/y.shape[0]
        
        stats["time"]= end_time-start_time
        stats["accuracy"]=accuracy
        stats["accuracy_adv"]=accuracy_adv
        stats["mean_similarity"] = float(x_sim.mean().detach().cpu().numpy())
        stats["custom"]=algorithm.custom_stats
        
        self.stats_agg(stats, "n_data", y.size(0), op="sum")
        
        results=self.convert_stats(results)
        return {"adv": x_adv, "results": results, "stats": stats}

    def run_transfer(self, net, x, y, x_adv):
        stats = {}
        results={}
        y_pred_val_adv, y_pred_ind_adv =self.net_inference(net, x_adv).max(1)  # model prediction on adversarial examples
        y_pred_val, y_pred_ind = self.net_inference(net, x).max(1)  # model prediction on clean examples
        
        accuracy = y_pred_ind[y_pred_ind==y].shape[0]/y.shape[0]
        accuracy_adv = y_pred_ind_adv[y_pred_ind_adv==y].shape[0]/y.shape[0]
        
        stats["accuracy"] = accuracy
        stats["accuracy_adv"]=accuracy_adv
        return {"results": results, "stats": stats}
        
    def stats_agg(self, stats, key, value, op="cat"):
        if key not in stats.keys():
            stats[key] = value
            return

        if op == "cat":
            stats[key] = np.concatenate((stats[key], value), axis=0)
        elif op == "sum":
            stats[key] += value
        else:
            raise NotImplementedError
 
    def convert_stats(self, stats):
        for key in stats.keys():
            if type(stats[key]) == np.ndarray:
                stats[key] = stats[key].tolist()
        return stats
    
    def calculate_image_similarity(self, data1,data2):
        data1 = data1.flatten(1)
        data2 = data2.flatten(1)
        delta = torch.norm(data1 - data2, dim=1)
        diff = delta/(torch.sqrt(torch.norm(data1, dim=1)*torch.norm(data2, dim=1)))
        return torch.clip(1-diff, min=0)
        
