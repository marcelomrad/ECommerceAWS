import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as ssm from "aws-cdk-lib/aws-ssm";

import { Construct } from "constructs";


export class ProductsAppStack extends cdk.Stack {

    readonly productsFetchHandler: lambdaNodeJs.NodejsFunction;
    readonly productsAdminHandler: lambdaNodeJs.NodejsFunction;
    readonly productsDdb: dynamodb.Table;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        //criando tabela de produtos
        this.productsDdb = new dynamodb.Table(this, "productsDdb", {
            tableName: "products",
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            partitionKey: {
                name: "id",
                type: dynamodb.AttributeType.STRING,
            },
            billingMode : dynamodb.BillingMode.PROVISIONED,
            readCapacity: 1,
            writeCapacity: 1,
        });

        //Products Layer
        const productsLayerArn = ssm.StringParameter.valueForStringParameter(this, "ProductsLayerVersionArn");
        const productsLayer = lambda.LayerVersion.fromLayerVersionArn(this, "ProductsLayer", productsLayerArn);

        //funcao lambda que vai ter como permição o acesso a tabela de forma que ela possa ser apenas LIDA
        this.productsFetchHandler = new lambdaNodeJs.NodejsFunction(this, "productsFetchHandler", {
            functionName: "productsFetchHandler",
            entry: "lambda/products/productsFetchFunction.ts", // onde mostra o caminho da função lambda que vai ser executado
            handler: "handler",
            memorySize: 128,
            timeout: cdk.Duration.seconds(5),
            bundling: {
                minify: true,
                sourceMap: true,
            },
            environment: {
                PRODUCTS_DDB: this.productsDdb.tableName,
            },
            layers: [productsLayer]
        });

        //dando permição para a função lambda poder ler a tabela
        this.productsDdb.grantReadData(this.productsFetchHandler);

        //funcao lambda que vai ter como permição o acesso a tabela de forma a poder ESCREVER na tabela
        this.productsAdminHandler = new lambdaNodeJs.NodejsFunction(this, "productsAdminHandler", {
            functionName: "productsAdminHandler",
            entry: "lambda/products/productsAdminFunction.ts", // onde mostra o caminho da função lambda que vai ser executado
            handler: "handler",
            memorySize: 128,
            timeout: cdk.Duration.seconds(5),
            bundling: {
                minify: true,
                sourceMap: true,
            },
            environment: {
                PRODUCTS_DDB: this.productsDdb.tableName,
            },
            layers: [productsLayer]
        });

        //dando permição para a função lambda poder escrever na tabela
        this.productsDdb.grantWriteData(this.productsAdminHandler);
    }
}