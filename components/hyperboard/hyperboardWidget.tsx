import Script from "next/script";

export const HyperboardWidget = ({
  hyperboardId,
  showTable = false,
}: {
  hyperboardId: string;
  showTable?: boolean;
}) => {
  return (
    <>
      <Script
        async
        src="https://staging.hyperboards.org/widget/hyperboard-widget.js"
        type="module"
      />
      <div
        className="hyperboard-widget"
        data-hyperboard-id={hyperboardId}
        data-hyperboard-show-table={showTable.toString()}
      ></div>
    </>
  );
};
