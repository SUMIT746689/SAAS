<!-- docker build command -->

<!-- create docker image -->
sudo docker build --no-cache --progress plain -t ridoy235/elitbuzz:coaching_website_v1 --network=host .

<!-- create docker image with cache -->
sudo docker build --progress plain -t ridoy235/elitbuzz:coaching_website_v1 --network=host .

<!-- build container -->
docker run -d --name coaching_website_v1 -p  3001:3000 ridoy235/elitbuzz:coaching_website_v1