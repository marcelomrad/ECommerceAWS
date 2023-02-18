import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cwlogs from "aws-cdk-lib/aws-logs";

interface ECommerceApiStackProps extends cdk.StackProps {
    productsFetchHandler: lambdaNodeJs.NodejsFunction;
    productsAdminHandler: lambdaNodeJs.NodejsFunction;
}

export class EcommerceApiStack extends cdk.Stack {

    constructor(scope: Construct, id: string, props: ECommerceApiStackProps) {
        super(scope, id, props);

        //pastas que salvam os logs na aws
        const logGroup = new cwlogs.LogGroup(this, "ECommerceApiLogs");

        const api = new apigateway.RestApi(this, "ECommerceApi", {
            restApiName: "ECommerceApi",
            description: "This is a ECommerce API",
            cloudWatchRole: true,
            deployOptions: {
                accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
                accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
                    httpMethod: true,
                    ip: true, //em produção deve ser false
                    protocol: true,
                    requestTime: true,
                    resourcePath: true,
                    responseLength: true,
                    status: true,
                    caller: true,
                    user: true, //em produção deve ser false
                })
            }

        });

        //integrando a api com as funções lambda
        
        //funcao para buscar os produtos
        const productsFetchIntegration = new apigateway.LambdaIntegration(props.productsFetchHandler);
        //funcao para adicionar, editar e deletar produtos
        const productsAdminIntegration = new apigateway.LambdaIntegration(props.productsAdminHandler);
        
        // "/products" -> rota principal
        const prodructsResource = api.root.addResource("products");
        // "/products/{id}" -> rota para pegar um produto especifico
        const productIdResource = prodructsResource.addResource("{id}");

        // GET "/products"
        prodructsResource.addMethod("GET", productsFetchIntegration);

        // GET "/products/{id}"
        productIdResource.addMethod("GET", productsFetchIntegration);

        // POST "/products"
        prodructsResource.addMethod("POST", productsAdminIntegration);

        // PUT "/products/{id}"
        productIdResource.addMethod("PUT", productsAdminIntegration);

        // DELETE "/products/{id}"
        productIdResource.addMethod("DELETE", productsAdminIntegration);

        
    }
}