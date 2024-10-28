import Script from "next/script";

export const HyperboardWidgetContainer = ({
  hyperboardId,
}: {
  hyperboardId: string;
}) => {
  return (
    <div className="hyperboard-widget-container">
      <Script
        src="https://staging.hyperboards.org/widget/hyperboard-widget.js"
        type="module"
        strategy="afterInteractive"
      />
      <div
        className="hyperboard-widget"
        data-hyperboard-id={hyperboardId}
        data-hyperboard-show-table="false"
      />
    </div>
  );
};
