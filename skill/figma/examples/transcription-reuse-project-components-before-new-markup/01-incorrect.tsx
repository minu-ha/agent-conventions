<div className="flex flex-col">
	<div className="flex">
		<div className="w-[60px]">번호</div>
		<div className="w-[270px]">상품명</div>
	</div>
	{products.map((product) => (
		<div className="flex" key={product.id}>
			<div className="w-[60px]">{product.id}</div>
			<div className="w-[270px]">{product.name}</div>
		</div>
	))}
</div>
