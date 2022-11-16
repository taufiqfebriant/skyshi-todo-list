interface Props extends React.ComponentPropsWithoutRef<'svg'> {
	name: string;
	prefix?: string;
	color?: string;
}

export const SvgIcon = ({ name, prefix = 'icon', color = '#ffffff', ...rest }: Props) => {
	const symbolId = `#${prefix}-${name}`;

	return (
		<svg {...rest} aria-hidden="true">
			<use href={symbolId} fill={color} />
		</svg>
	);
};
