// [!code error]
const {status: orderStatus, owner: orderOwner} = order;

// [!code error]
if (orderStatus === "archived") {
// [!code error]
	notify(orderOwner);
}
