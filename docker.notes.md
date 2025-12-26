 #docker-compose up --build 
 #docker-compose up --build -d (detached mode)
 #docker-compose down (stop and remove containers)

 
 docker-compose down -v (stop and remove containers and volumes)

 docker-compose ps (list running containers)


 # docker-compose logs (view logs)
 # docker-compose logs container_name


 docker-compose logs -f (follow logs)
 docker-compose logs -f backend (follow backend logs)
 docker-compose logs -f frontend (follow frontend logs)


