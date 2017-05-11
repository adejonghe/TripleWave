IMG_TAG=caprads/triplewave

build:
	docker rmi $(IMG_TAG); true
	docker build -t $(IMG_TAG) .
