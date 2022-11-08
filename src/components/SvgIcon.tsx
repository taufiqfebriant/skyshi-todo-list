interface Props extends React.ComponentPropsWithoutRef<'svg'> {
	name: string;
	prefix?: string;
	color?: string;
}

const SvgIcon = ({ name, prefix = 'icon', color = '#ffffff', ...props }: Props) => {
	const symbolId = `#${prefix}-${name}`;

	return (
		<svg {...props} aria-hidden="true">
			<use href={symbolId} fill={color} />
		</svg>
	);
};

export default SvgIcon;
