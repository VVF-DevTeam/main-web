declare module "stripe" {
  namespace Stripe {
    interface Invoice {
      subscription: string;
      subscription_details: {
        metadata: object;
      };
    }
  }
}