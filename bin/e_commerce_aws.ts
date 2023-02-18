#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
// import dotenv from 'dotenv'; 

import { EcommerceApiStack } from '../lib/ecommerceApi-stack';
import { ProductsAppStack } from '../lib/productsApp-stack';


// dotenv.config();

const app = new cdk.App();

const env : cdk.Environment = {
    account: "851535911247", //process.env.AWS_ID_ACCOUNT
    region: "us-east-1" //process.env.AWS_REGION
}

const tags = {
  cost : "ECommerce",
  team : "MradCode"
}

const productsAppStack = new ProductsAppStack(app, "ProductsApp", {
  tags: tags,
  env: env
});

const eCommerceApiStack = new EcommerceApiStack(app, "ECommerceApi", {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminHandler: productsAppStack.productsAdminHandler,
  tags: tags,
  env: env
});

eCommerceApiStack.addDependency(productsAppStack);