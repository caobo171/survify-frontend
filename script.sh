pm2 delete -p 6000 survify-frontend
pm2 start yarn --name survify-frontend -- start