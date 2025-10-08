pm2 delete -p 6002 survify-frontend
pm2 start yarn --name survify-frontend -- start