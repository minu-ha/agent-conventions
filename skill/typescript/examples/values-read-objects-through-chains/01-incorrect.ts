const {status: orderStatus, ownerId: orderOwnerId} = order;

if (orderStatus === "cancelled") {
	notify(orderOwnerId);
}
