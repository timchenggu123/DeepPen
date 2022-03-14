import torch
import os
import pickle
import torch.nn.functional as F

class DeepPenNetTrainer():
    def __init__(self, net, optim, train_loader, test_loader, 
            device='cpu',log_interval = 10, save_path = './networks/', verbose=False):
        
        self.net = net
        self.optim = optim
        self.train_loader = train_loader
        self.test_loader = test_loader
        
        self.save_path = save_path
        self.log_interval = log_interval
        self.verbose = verbose

        self.train_losses = []
        self.train_counter = []
        self.test_losses = []
        self.device = device

        torch.autograd.set_detect_anomaly(True)

    def run(self, n_epochs=None, verbose = False, threshold = 0.85, max_epochs=20):
        self.verbose = verbose
        if n_epochs is not None:
            for epoch in range(1, n_epochs + 1):
                self.train(epoch)
                self.test()
        else:
            for epoch in range(1, max_epochs):
                self.train(epoch)
                self.save()
                if self.test() > threshold:
                    break
                

    def train(self,epoch):
        network = self.net
        optimizer = self.optim
        train_loader = self.train_loader
        network.to(self.device)
        network.train()
        for batch_idx, (data, target) in enumerate(train_loader):
            data= data.to(self.device)
            target=target.to(self.device)
            optimizer.zero_grad()
            output = network(data)
            loss = F.nll_loss(output, target)
            loss.backward()
            torch.nn.utils.clip_grad_value_(network.parameters(), 5)
            optimizer.step()

            if self.verbose == True and batch_idx % self.log_interval == 0:
                print('Train Epoch: {} [{}/{} ({:.0f}%)]\tLoss: {:.6f}'.format(
                    epoch, batch_idx * len(data), len(train_loader.dataset),
                    100. * batch_idx / len(train_loader), loss.item()))
            self.train_losses.append(loss.item())
            self.train_counter.append(
                (batch_idx*64) + ((epoch-1)*len(train_loader.dataset)))
            
              # torch.save(optimizer.state_dict(), self.save_path + str(hash(network)) + 'optimizer.pth')

    def save(self):
        net=self.net
        if self.save_path is not None:
            self.net.to('cpu')
            self.check_path()
            torch.save(net.state_dict(), self.save_path + net.name + 'model.pth')
              
    def test(self):
        network=self.net
        test_loader = self.test_loader
        network.to(self.device)
        network.eval()
        test_loss = 0
        correct = 0
        with torch.no_grad():
            for data, target in test_loader:
                data=data.to(self.device)
                target=target.to(self.device)
                output = network(data)
                test_loss += F.nll_loss(output, target, size_average=False).item()
                pred = output.data.max(1, keepdim=True)[1]
                correct += pred.eq(target.data.view_as(pred)).sum()
        test_loss /= len(test_loader.dataset)
        self.test_losses.append(test_loss)
        
        if self.verbose:
            print('\nTest set: Avg. loss: {:.4f}, Accuracy: {}/{} ({:.0f}%)\n'.format(
        test_loss, correct, len(test_loader.dataset),
        100. * correct / len(test_loader.dataset)))

        return correct / len(test_loader.dataset)

    def check_path(self):
        if self.save_path == None:
            return
        if not os.path.isdir(self.save_path):
            os.makedirs(self.save_path)
