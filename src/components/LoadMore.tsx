export default function LoadMore({offset, isDataFetched, updateOffset}:
{
	offset: number;
	isDataFetched: boolean;
	updateOffset: () => void;
}) {
	return offset < 450 && isDataFetched
		? <button className='btn btn-primary load-more' onClick={() => updateOffset()}>Mehr laden</button>
		: <></>
}