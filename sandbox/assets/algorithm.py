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
    
from lib2to3.pytree import convert
from DeepPenAlgorithm import DeepPenAlgorithm
from cleverhans.torch.attacks.fast_gradient_method import fast_gradient_method
import numpy as np
from tensorflow import Tensor
from tensorflow import convert_to_tensor
from MyModules.src.generator.fuzzer import Fuzzer
from MyModules.src.generator.genetic import SimilarGenetic
from func_timeout import func_timeout
from time import time

class Solution(DeepPenAlgorithm):
    def run_algorithm(self, net, x: np.ndarray, y: np.ndarray) -> Tensor:
        x_advs = []
        par2=0
        for i in range(x.shape[0]):
            try:
                alg = SimilarGenetic("", net, "", x[[i]], y[[i]])
            except:
                x_advs.append(x[[i]])
                continue
            try:
                start = time()
                func_timeout(timeout=5, func=Solution.runGenerator, args=[alg])
                end = time()
                part2+=end-start
            except:
                par2+=5*2
                pass
            x_advs.append(alg.advImage)
            self.append_custom_stats("par2", "line", par2)
        x_advs = np.concatenate(x_advs, axis=0)
        return convert_to_tensor(x_advs)
    
    @staticmethod
    def runGenerator(alg):
        alg.generateAdversarialExample()
        