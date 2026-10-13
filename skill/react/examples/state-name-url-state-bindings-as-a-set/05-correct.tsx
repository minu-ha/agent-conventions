const [searchParams] = useSearchParams();

<UiShareLinkButton href={`/products?${searchParams.toString()}`} />;
