// Test form to build full checkout page into the website

// import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
// import { useState } from "react";

// const CheckoutForm = () => {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!stripe || !elements) {
//       return;
//     }

//     setIsLoading(true);

//     const { error } = await stripe.confirmPayment({
//       elements,
//       confirmParams: {
//         return_url: `${window.location.origin}/success`,
//       },
//     });

//     if (error) {
//       console.log("[Error]", error.message);
//     }

//     setIsLoading(false);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-white shadow rounded-lg">
//       <h2 className="text-xl font-bold mb-4">Subscribe to Cursor Pro</h2>

//       <div className="mb-4">
//         <PaymentElement />
//       </div>

//       <button
//         type="submit"
//         disabled={isLoading}
//         className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
//       >
//         {isLoading ? "Processing..." : "Subscribe"}
//       </button>
//     </form>
//   );
// };

// export default CheckoutForm;