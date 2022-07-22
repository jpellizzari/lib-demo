.PHONY: proto proto-deps


proto-deps: ## Update protobuf dependencies
	buf mod update

proto: ## Generate protobuf files
	@# The ones with no version use the library inside the code already
	@# so always use same version
	@go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-grpc-gateway \
	  github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-openapiv2 \
	  google.golang.org/protobuf/cmd/protoc-gen-go
	@go install github.com/grpc-ecosystem/protoc-gen-grpc-gateway-ts
	@go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.1.0
	@go install github.com/bufbuild/buf/cmd/buf@v1.1.0
	buf generate
