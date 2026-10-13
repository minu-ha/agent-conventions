const {status: orderStatus, owner: orderOwner} = order;

if (orderStatus === "archived") {
	notify(orderOwner);
}
