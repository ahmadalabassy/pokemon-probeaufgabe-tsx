export default function LoadMore({offset, updateOffset}:
{
	offset: number;
	updateOffset: () => void;
}) {
	return offset < 550
		? <button className='btn btn-primary load-more' onClick={() => updateOffset()}>Mehr laden</button>
		: <></>
}