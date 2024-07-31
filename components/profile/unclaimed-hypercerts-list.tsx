import { EmptySection } from "@/app/profile/[address]/sections";
import UnclaimedHypercertListItem from "./unclaimed-hypercert-list-item";

export default async function UnclaimedHypercertsList({
	unclaimedHypercerts,
	isEmptyAllowlist,
}: {
	unclaimedHypercerts: any[];
	isEmptyAllowlist: boolean;
}) {
	if (isEmptyAllowlist || unclaimedHypercerts.length === 0) {
		return <EmptySection />;
	}

	return (
		<div className="grid grid-cols-[repeat(auto-fit,_minmax(270px,_1fr))] gap-4">
			{unclaimedHypercerts.map((unclaimedHypercert, i) => (
				<UnclaimedHypercertListItem
					allowListRecordFragment={unclaimedHypercert}
					key={i}
				/>
			))}
		</div>
	);
}
