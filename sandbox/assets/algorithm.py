# from DeepPenAlgorithm import DeepPenAlgorithm
# # from cleverhans.torch.attacks.fast_gradient_method import fast_gradient_method
# from cleverhans.tf2.attacks.fast_gradient_method import fast_gradient_method
# import numpy as np
# from tensorflow import Tensor

# class Solution(DeepPenAlgorithm):
#     def run_algorithm(self, net, data) -> Tensor:
#         eps = 0.1
#         x_fgm = fast_gradient_method(net, data, eps, np.inf)
#         return x_fgm
    
from DeepPenAlgorithm import DeepPenAlgorithm
from cleverhans.torch.attacks.fast_gradient_method import fast_gradient_method
import numpy as np
from torch import Tensor

class Solution(DeepPenAlgorithm):
    def run_algorithm(self, net, data) -> Tensor:
        eps = 0.1
        x_fgm = fast_gradient_method(net, data, eps, np.inf)
        return x_fgm
