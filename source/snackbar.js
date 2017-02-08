import React, { PureComponent, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import styler from 'react-styling'

// Sits at the bottom of a page and displays notifications
export default class Snackbar extends PureComponent
{
	static propTypes =
	{
		// Snackbar value (either a message, or an object)
		value : PropTypes.oneOfType([PropTypes.string, PropTypes.object]),

		// Must reset the `value`.
		reset : PropTypes.func.isRequired,

		// "Snack" hiding CSS animation duration.
		// Is 400 milliseconds by default.
		hideAnimationDuration : PropTypes.number.isRequired,

		// The total display duration (in milliseconds) of a snack
		// is `minTime + message.length * lengthTimeFactor`
		minTime          : PropTypes.number.isRequired,
		lengthTimeFactor : PropTypes.number.isRequired
	}

	static defaultProps =
	{
		hideAnimationDuration : 400,
		minTime          : 1200,
		lengthTimeFactor : 60
	}

	state =
	{
		values: []
	}

	constructor()
	{
		super()

		this.next = this.next.bind(this)
	}

	componentWillReceiveProps(new_props)
	{
		const { value, reset } = new_props

		// Redux has an optimization built in:
		// it won't rerender a `@connect`ed component
		// if its new `props` are shallowly equal to the previous ones.
		// Therefore, manually resetting the `value` property here
		// immediately after receiving it (a non-`undefined` value)
		// so that the same notification message could later be displayed.
		if (value)
		{
			// Add the notification to the queue
			this.push(value)
			// Reset the `value` property immediately
			reset()
		}
	}

	// Adds a notification to the queue
	push(new_value)
	{
		const { values, value } = this.state

		// Add the notification to the queue
		values.push(new_value)

		// If the notification queue was empty
		// then kick-start it.
		if (!value)
		{
			this.next()
		}
	}

	// Displays the next notification in the queue
	next()
	{
		const { values } = this.state

		const
		{
			hideAnimationDuration,
			minTime,
			lengthTimeFactor
		}
		= this.props

		// Get the next notification from the queue
		// (will be `undefined` if the queue is empty)
		const value = values.shift()

		// Reset the notification display
		this.setState({ value, height: undefined, hiding: false })

		// If the queue is empty, then just exit
		if (!value)
		{
			return
		}

		// `state.show` will be set to `true` later,
		// when the height of the element is measured
		// (which is after it renders)

		// Hide the notification after it expires
		this.auto_hide_timer = setTimeout(() =>
		{
			// Clearing memory
			this.auto_hide_timer = undefined

			// Start the hiding animation for the notification
			this.setState({ show: false, hiding: true })

			// Display the next notification
			// after the currently being hidden one
			// finishes its hiding animation.
			setTimeout(this.next, hideAnimationDuration)
		},
		// The total display duration (in milliseconds) of a snack
		// is `minTime + message.length * lengthTimeFactor`
		minTime + String(value).length * lengthTimeFactor)
	}

	componentDidUpdate()
	{
		let { height, value } = this.state

		// The notification DOM element has just been rendered
		// which means its dimensions are set by now.
		// Calculate the notification container DOM element height
		// so that the slide-from-bottom animation knows
		// its target Y-position for the CSS `translate` transform.
		if (height === undefined && value)
		{
			height = ReactDOM.findDOMNode(this.snackbar).offsetHeight
			const anti_lag_timeout = 100 // Otherwise it would jump to fully shown in Chrome when there's a queue of snacks waiting to be shown
			this.setState({ height }, () => setTimeout(() => this.setState({ show: true }), anti_lag_timeout))
		}
	}

	render()
	{
		const { hideAnimationDuration } = this.props
		const { show, value, height, hiding } = this.state

		let y = 0

		// If no snack is being shown,
		// or if a snack is about to be shown,
		// then shift it under the screen's bottom border
		// to show the slide-from-bottom animation at the next step.
		if (!show && height !== undefined)
		{
			y = `${height}px`
		}

		const container_style =
		{
			...styles.container,
			visibility : show ? 'visible' : 'hidden',
			transform  : `translateY(${y})`,
			transition : `transform ${hideAnimationDuration}ms ease-out, visibility ${hideAnimationDuration}ms ease-out`
		}

		if (!show && !hiding)
		{
			container_style.transition = 'none'
		}

		const snackbar_style = styles.snackbar

		const snackbar_text_style =
		{
			...styles.text,
			opacity    : show ? 1 : 0,
			transition : `opacity ${hideAnimationDuration}ms cubic-bezier(0.23, 1, 0.32, 1) 0ms`
		}

		const markup =
		(
			<div
				style={ container_style }
				className="rrui__snackbar__container">

				<div
					ref={ ref => this.snackbar = ref }
					style={ snackbar_style }
					className="rrui__snackbar">

					<div
						style={ snackbar_text_style }
						className="rrui__snackbar__text">
						{ value }
					</div>
				</div>
			</div>
		)

		return markup
	}
}

const styles = styler
`
	container
		display  : flex
		position : fixed
		left     : 0
		right    : 0
		bottom   : 0
		pointer-events : none

	snackbar
		flex-grow : 0
		margin    : auto
		pointer-events : auto

	text
		opacity : 0
		white-space : nowrap
		overflow    : hidden
`