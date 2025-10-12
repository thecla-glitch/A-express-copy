import { useQuery } from "@tanstack/react-query";
import { getPaymentCategories } from "@/lib/api-client";

export const usePaymentCategories = () => {
  const { data, ...rest } = useQuery({
    queryKey: ["payment-categories"],
    queryFn: () => getPaymentCategories().then((res) => res.data),
  });
  return { data, ...rest };
};