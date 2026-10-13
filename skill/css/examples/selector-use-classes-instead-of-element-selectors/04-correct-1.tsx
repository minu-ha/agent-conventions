<div
	className={clsx("wg_productDetail__prose")}
	dangerouslySetInnerHTML={{
		// biome-ignore lint/style/useNamingConvention: React 가 정한 속성 이름
		__html: product.bodyHtml,
	}}
/>
