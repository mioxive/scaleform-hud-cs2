var DamageSize = '200px';

var DamageRoot = contextPanel.FindChildTraverse('Damage');
if (DamageRoot) {
	try {
		DamageRoot.style.width = DamageSize;
		DamageRoot.style.height = DamageSize;
	} catch (error) {
	}
	var DamageSegments = DamageRoot.FindChildrenWithClassTraverse('Damage__Segment');
	for (var DamageAt = 0; DamageAt < DamageSegments.length; ++DamageAt) {
		try {
			DamageSegments[DamageAt].style.clip = 'radial( 50% 50%, 315deg, 90deg )';
		} catch (clipError) {
			break;
		}
	}
} else {
}
