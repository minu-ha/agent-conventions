// [!code error]
<div className="flex gap-[4px] items-center" data-node-id="12:380">
{/* [!code error] */}
	<p className="font-['Pretendard:SemiBold'] text-[16px]">{product.name}</p>
{/* [!code error] */}
	<div className="flex h-[10px] items-center justify-center w-0">
{/* [!code error] */}
		<div className="flex-none rotate-90">
{/* [!code error] */}
			<div className="h-0 relative w-[10px]">
{/* [!code error] */}
				<div className="absolute inset-[-1px_0_0_0]">
{/* [!code error] */}
					<img src={imgLine94} />
				</div>
			</div>
		</div>
	</div>
	<span className="text-[14px]">{product.stock}</span>
</div>
