import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

import { Input } from "../ui/input";
import { useHypercertExchangeClient } from "@/hooks/use-hypercert-exchange-client";

export function ListAskedPrice({
	price,
	setPrice,
	currency,
	setCurrency,
}: {
	price: string;
	setPrice: (price: string) => void;
	currency: string;
	setCurrency: (currency: string) => void;
}) {
	const { client } = useHypercertExchangeClient();
	if (!client) return null;

	const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		// Allow only non-negative numbers. If form validation is required we could consider using zod.
		if (/^\d*\.?\d*$/.test(value)) {
			setPrice(value);
		}
	};

	return (
		<div className="flex gap-2 w-full">
			<Input
				name="price"
				type="text"
				placeholder="Price"
				value={price}
				onChange={handlePriceChange}
				className="flex-grow"
			/>
			<Select value={currency} onValueChange={setCurrency}>
				<SelectTrigger className="w-[120px]">
					<SelectValue placeholder="Currency" />
				</SelectTrigger>
				<SelectContent>
					{Object.values(client.currencies).map((currency) => (
						<SelectItem key={currency.address} value={currency.address}>
							{currency.symbol}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
