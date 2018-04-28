import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { polyfill as reactLifecyclesCompat } from 'react-lifecycles-compat'
import classNames from 'classnames'

import Ellipsis from './Ellipsis'
import Close, { CloseIcon } from './Close'

import
{
	submitFormOnCtrlEnter,
	submitContainingForm,
	getScrollbarWidth,
	isInternetExplorer,
	scrollIntoViewIfNeeded
}
from './utility/dom'

// Possible enhancements:
//
//  * If the menu is close to a screen edge,
//    automatically reposition it so that it fits on the screen
//  * Maybe show menu immediately above the toggler
//    (like in Material design), not below it.
//
// https://material.google.com/components/menus.html

const Empty_value_option_value = ''

const value_prop_type = PropTypes.oneOfType
([
	PropTypes.string,
	PropTypes.number,
	PropTypes.bool
])

@reactLifecyclesCompat
export default class Select extends Component
{
	static propTypes =
	{
		// A list of selectable options
		options : PropTypes.arrayOf
		(
			PropTypes.shape
			({
				// Option value (may be `undefined`)
				value : value_prop_type,
				// Option label (may be `undefined`)
				label : PropTypes.string,
				// Option icon
				icon  : PropTypes.oneOfType
				([
					PropTypes.node,
					PropTypes.func
				])
			})
		),

		// An alternative way of getting `options`.
		// If it's an `autocomplete` then this function
		// receives the `query : string` argument.
		// Is only for `autocomplete` mode.
		// Can return a `Promise`.
		getOptions : PropTypes.func,

		// Throttle `async getOptions()` invocations.
		throttle : PropTypes.number.isRequired,

		// Throttle `async getOptions()` invocations.
		minCharactersToStartThrottling : PropTypes.number.isRequired,

		// HTML form input `name` attribute
		name       : PropTypes.string,

		// Label which is placed above the select
		label      : PropTypes.string,

		// Placeholder (like "Choose")
		placeholder : PropTypes.string,

		// Whether to use native `<select/>`
		native      : PropTypes.bool.isRequired,

		// Whether to use native `<select/>` when expanded
		nativeExpanded : PropTypes.bool.isRequired,

		// Show icon only for selected item,
		// and only if `concise` is `true`.
		saveOnIcons : PropTypes.bool,

		// Disables this control
		disabled   : PropTypes.bool,

		// Set to `true` to mark the field as required
		required   : PropTypes.bool.isRequired,

		// Set to `true` to display the loading indicator
		loading    : PropTypes.bool.isRequired,

		// Selected option value
		value      : value_prop_type,

		// Is called when an option is selected
		onChange   : PropTypes.func,

		// Is called when the select is focused
		onFocus    : PropTypes.func,

		// Is called when the select is blurred.
		// This `onBlur` interceptor is a workaround for `redux-form`,
		// so that it gets the parsed `value` in its `onBlur` handler,
		// not the formatted text.
		onBlur     : PropTypes.func,

		// (exotic use case)
		// Falls back to a plain HTML input
		// when javascript is disabled (e.g. Tor)
		fallback   : PropTypes.bool.isRequired,

		// Component CSS class
		className  : PropTypes.string,

		// Autocomplete `<input/>` CSS class
		inputClassName : PropTypes.string,

		// `<button/>` toggler CSS class
		toggleClassName : PropTypes.string,

		// CSS style object
		style      : PropTypes.object,

		// If this flag is set to `true`,
		// and `icon` is specified for a selected option,
		// then the selected option will be displayed
		// as icon only, without the label.
		concise    : PropTypes.bool,

		// If this flag is set to `true`,
		// then it makes `<Select/>` not stretch itself
		// to 100% width by making it `inline-block`.
		// Is set to `true` when `concise` is `true`
		// because it makes sense.
		compact    : PropTypes.bool,

		// HTML `tabindex` attribute
		tabIndex   : PropTypes.number,

		// If set to `true`, autocompletion is available
		// upon expanding the options list.
		autocomplete : PropTypes.bool,

		// If set to `true`, autocomple will show all
		// matching options instead of just `maxItems`.
		autocompleteShowAll : PropTypes.bool,

		// Options list alignment ("left", "right")
		alignment  : PropTypes.oneOf(['left', 'right']),

		// If `menu` flag is set to `true`
		// then it's gonna be a dropdown menu
		// with `children` elements inside
		// and therefore `onChange` won't be called
		// on menu item click.
		menu       : PropTypes.bool,

		// If `menu` flag is set to `true`
		// then `toggler` is the dropdown menu button.
		// Can be either a React element or a React component.
		// If `toggler` is a React component then it must
		// accept `onClick` and `onKeyDown` properties.
		// E.g.: `(props) => <button type="button" {...props}> Menu </button>`.
		toggler    : PropTypes.oneOfType
		([
			PropTypes.element,
			PropTypes.func
		]),

		// If `scroll` is `false`, then options list
		// is not limited in height.
		// Is `true` by default (scrollable).
		scroll     : PropTypes.bool.isRequired,

		// If this flag is set to `true`,
		// then the dropdown expands itself upward.
		// (as opposed to the default downward)
		upward     : PropTypes.bool,

		// Maximum items fitting the options list height (scrollable).
		// In case of `autocomplete` that's the maximum number of matched items shown.
		// Is `6` by default.
		maxItems   : PropTypes.number.isRequired,

		// Is `true` by default (only when the list of options is scrollable)
		scrollbarPadding : PropTypes.bool,

		focusUponSelection : PropTypes.bool.isRequired,

		// When the `<Select/>` is expanded
		// the options list may not fit on the screen.
		// If `scrollIntoView` is `true` (which is the default)
		// then the browser will automatically scroll
		// so that the expanded options list fits on the screen.
		scrollIntoView : PropTypes.bool.isRequired,

		// If `scrollIntoView` is `true` (which is the default)
		// then these two are gonna define the delay after which it scrolls into view.
		expandAnimationDuration : PropTypes.number.isRequired,
		keyboardSlideAnimationDuration : PropTypes.number.isRequired,

		onTabOut : PropTypes.func,

		onToggle : PropTypes.func,

		// `aria-label` for the `<Select/>`'s `<button/>`
		ariaLabel : PropTypes.string.isRequired,

		// `aria-label` for the "Close" button
		// (which is an "x" visible in fullscreen mode).
		closeLabel : PropTypes.string,

		// The "x" button icon that closes the `<Select/>`
		// in fullscreen mode on mobile devices.
		closeButtonIcon : PropTypes.oneOfType([PropTypes.func, PropTypes.oneOf([false])]).isRequired

		// transition_item_count_min : PropTypes.number,
		// transition_duration_min : PropTypes.number,
		// transition_duration_max : PropTypes.number
	}

	static defaultProps =
	{
		alignment          : 'left',
		scroll             : true,
		maxItems           : 6,
		scrollbarPadding   : true,
		focusUponSelection : true,
		fallback           : false,
		native             : false,
		nativeExpanded     : false,
		scrollIntoView     : true,

		// If `scrollIntoView` is `true` (which is the default)
		// then these two are gonna define the delay after which it scrolls into view.
		expandAnimationDuration : 150,
		keyboardSlideAnimationDuration : 300,

		// Set to `true` to mark the field as required
		required : false,

		// Set to `true` to display the loading indicator
		loading : false,

		// `async getOptions()` throttle period.
		throttle : 200,

		// `async getOptions()` throttle threshold (in characters).
		minCharactersToStartThrottling : 4,

		// `aria-label` for the `<Select/>`'s `<button/>`
		ariaLabel : 'Select country',

		// The "x" button icon that closes the `<Select/>`
		// in fullscreen mode on mobile devices.
		closeButtonIcon : CloseIcon

		// transition_item_count_min : 1,
		// transition_duration_min : 60, // milliseconds
		// transition_duration_max : 100 // milliseconds
	}

	state =
	{
		// Is initialized during the first `componentDidUpdate()` call
		vertical_padding : 0,

		// `getOptions()` must receive a `string`.
		autocomplete_input_value : '',

		// The currently displayed `options` counter.
		// (in case of `autocomplete` and `async getOptions()`).
		optionsCounter : 0,
		matchesCounter : 0,

		// Will be re-fetched in `componentDidMount()`.
		options : this.props.options || [],

		// `prevProps` for `getDerivedStateFromProps()`.
		props:
		{
			value   : this.props.value,
			options : this.props.options
		}
	}

	// Latest async `getOptions()` invocation timestamp (for throttling).
	latestFetchOptionsCallTimestamp = 0

	// Older options can only be overwritten with newer ones.
	// (in case of `autocomplete` and `async getOptions()`).
	counter = new Counter()

	// `ref`s of all `options` currently rendered.
	options_refs = {}

	constructor(props)
	{
		super(props)

		const
		{
			value,
			autocomplete,
			options,
			getOptions,
			children,
			menu,
			toggler,
			onChange
		}
		= this.props

		if (autocomplete)
		{
			if (!options && !getOptions)
			{
				throw new Error(`Either "options" property or "getOptions" property are required for an "autocomplete" select`)
			}
		}

		if (getOptions && !autocomplete)
		{
			throw new Error(`"getOptions" property is only available for an "autocomplete" select`)
		}

		if (children && !menu)
		{
			React.Children.forEach(children, (element) =>
			{
				if (!element.props.value)
				{
					throw new Error(`You must specify "value" prop on each child of <Select/>`)
				}

				if (!element.props.label)
				{
					throw new Error(`You must specify "label" prop on each child of <Select/>`)
				}
			})
		}

		if (menu && !toggler)
		{
			throw new Error(`Supply a "toggler" component when enabling "menu" in <Select/>`)
		}

		if (!menu && !onChange)
		{
			throw new Error(`"onChange" property must be specified for a non-menu <Select/>`)
		}
	}

	static getDerivedStateFromProps({ autocomplete, value, options }, state)
	{
		const newState =
		{
			// `prevProps`.
			props:
			{
				value,
				options
			}
		}

		// Not re-fetching async options here.
		if (Array.isArray(options))
		{
			const _options = _getOptions(options, null, state.autocomplete_input_value)

			// `<Select autocomplete/>`'s selected option label
			// is stored in a special `selectedOptionLabel` variable in `this.state`.
			if (autocomplete)
			{
				if (newState.props.options !== state.props.options
					|| newState.props.value !== state.props.value)
				{
					newState.selectedOptionLabel = getSelectedOptionLabel(value, _options)
				}
			}
			// Regular `<Select/>`'s selected option label
			// is calculated in `.render()` from `this.state.options`.
			else
			{
				newState.options = _options
			}
		}

		return newState
	}

	// Client side rendering, javascript is enabled
	componentDidMount()
	{
		const { fallback, nativeExpanded } = this.props

		document.addEventListener('click', this.onDocumentClick)

		if (fallback)
		{
			this.setState({ javascript: true })
		}

		if (nativeExpanded)
		{
			this.resize_native_expanded_select()
			window.addEventListener('resize', this.resize_native_expanded_select)
		}

		// If some initial `value` is set then
		// the `options` are required to display that `value`.
		this.fetchOptions()
	}

	componentDidUpdate(previous_props, previous_state)
	{
		const { nativeExpanded, value } = this.props
		const { expanded, height } = this.state

		if (expanded !== previous_state.expanded)
		{
			if (expanded && this.should_animate())
			{
				if (height === undefined)
				{
					this.calculate_height()
				}
			}
		}

		// If the `value` changed then resize the native expanded `<select/>`
		if (nativeExpanded && value !== previous_props.value)
		{
			this.resize_native_expanded_select()
		}
	}

	componentWillUnmount()
	{
		const { nativeExpanded } = this.props

		document.removeEventListener('click', this.onDocumentClick)

		if (nativeExpanded)
		{
			window.removeEventListener('resize', this.resize_native_expanded_select)
		}

		clearTimeout(this.toggle_timeout)
		clearTimeout(this.scroll_into_view_timeout)
		clearTimeout(this.restore_focus_on_collapse_timeout)
		clearTimeout(this.nextFetchOptionsCallTimeout)
	}

	storeContainer = (node) => this.select = node
	storeListNode = (node) => this.list = node
	storeSelectedOption = (ref) => this.selected = ref
	storeAutocompleteInput = (node) => this.autocomplete = node

	render()
	{
		const
		{
			id,
			upward,
			concise,
			compact,
			scroll,
			children,
			menu,
			toggler,
			alignment,
			autocomplete,
			saveOnIcons,
			maxItems,
			fallback,
			native,
			nativeExpanded,
			disabled,
			required,
			placeholder,
			label,
			value,
			error,
			closeButtonIcon : CloseButtonIcon,
			closeLabel,
			loading,
			style,
			className
		}
		= this.props

		const
		{
			options,
			isFetchingOptions,
			expanded,
			list_height
		}
		= this.state

		let list_style

		// Makes the options list scrollable.
		// (only when not in `autocomplete` mode)
		if (this.is_scrollable() && list_height !== undefined)
		{
			list_style = { maxHeight: `${list_height}px` }
		}

		let list_items

		// If a list of options is supplied as a set of child React elements,
		// then render those elements.
		if (children)
		{
			list_items = React.Children.map(children, (element, index) =>
			{
				if (!element)
				{
					return
				}

				return this.render_list_item({ index, element })
			})
		}
		// If a list of options is supplied as an array of `{ value, label }`,
		// then transform those elements to <buttons/>
		else
		{
			const overflow = scroll && this.overflown()

			list_items = this.getCurrentlyDisplayedOptions().map(({ value, label, icon }, index) =>
			{
				return this.render_list_item
				({
					index,
					value,
					label,
					icon: !saveOnIcons && icon,
					overflow
				})
			})
		}

		const wrapper_style = { textAlign: alignment }

		const selected = this.get_selected_option()

		const show_options_list = !native && !nativeExpanded && list_items.length > 0
		const show_label = label && (this.get_selected_option() || placeholder)

		return (
			<div
				ref={ this.storeContainer }
				onKeyDown={ this.on_key_down_in_container }
				onBlur={ this.on_blur }
				style={ style ? { ...wrapper_style, ...style } : wrapper_style }
				className={ classNames
				(
					'rrui__select',
					{
						'rrui__rich'                 : fallback,
						'rrui__select--autocomplete' : autocomplete,
						'rrui__select--menu'         : menu,
						'rrui__select--upward'       : upward,
						'rrui__select--expanded'     : expanded,
						'rrui__select--collapsed'    : !expanded,
						'rrui__select--disabled'     : disabled,
						'rrui__select--compact'      : compact || (concise && !autocomplete)
					},
					className
				) }>

				<div
					className={ classNames
					({
						'rrui__input': !toggler
					}) }>

					{ (loading || isFetchingOptions) && <Ellipsis/> }

					{/* Currently selected item */}
					{ !menu && !native && this.render_selected_item(show_label) }

					{/* Label */}
					{/* (this label is placed after the "selected" button
					     to utilize the CSS `+` selector) */}
					{/* If the `placeholder` wasn't specified
					    but `label` was and no option is currently selected
					    then the `label` becomes the `placeholder`
					    until something is selected */}
					{ show_label &&
						<label
							htmlFor={ id }
							className={ classNames('rrui__input-label',
							{
								'rrui__input-label--required' : required && value_is_empty(value),
								'rrui__input-label--invalid'  : this.should_indicate_invalid()
							}) }>
							{ label }
						</label>
					}

					{/* Menu toggler */}
					{ menu && this.render_toggler() }

					{/* The list of selectable options */}
					{ show_options_list &&
						<ul
							ref={ this.storeListNode }
							style={ list_style }
							className={ classNames
							(
								'rrui__expandable',
								'rrui__expandable--overlay',
								'rrui__select__options',
								'rrui__shadow',
								{
									'rrui__select__options--autocomplete'  : autocomplete,
									'rrui__select__options--menu'          : menu,
									'rrui__expandable--expanded'           : expanded,
									'rrui__select__options--expanded'      : expanded,
									'rrui__expandable--left-aligned'       : alignment === 'left',
									'rrui__expandable--right-aligned'      : alignment === 'right',
									'rrui__select__options--left-aligned'  : !children && alignment === 'left',
									'rrui__select__options--right-aligned' : !children && alignment === 'right',
									// CSS selector performance optimization
									'rrui__select__options--upward'        : upward,
									'rrui__select__options--downward'      : !upward
								}
							) }>
							{ list_items }
						</ul>
					}

					{/* The "x" button to hide the list of options
					    for fullscreen `<Select/>` on mobile devices */}
					{ show_options_list && expanded && CloseButtonIcon &&
						<Close
							onClick={ this.onToggle }
							closeLabel={ closeLabel }
							className={ classNames('rrui__close--bottom-right', 'rrui__select__close',
							{
								'rrui__select__close--autocomplete' : autocomplete
							}) }>
							<CloseButtonIcon/>
						</Close>
					}

					{/* Fallback in case javascript is disabled */}
					{ (native || (fallback && !this.state.javascript)) && this.render_static() }
				</div>

				{/* Error message */}
				{ this.should_indicate_invalid() &&
					<div className="rrui__input-error">{ error }</div>
				}
			</div>
		)
	}

	render_list_item({ index, element, value, label, icon, overflow }) // , first, last
	{
		const { disabled, menu, scrollbarPadding } = this.props
		const { focused_option_value, expanded } = this.state

		// If a list of options is supplied as a set of child React elements,
		// then extract values from their props.
		if (element)
		{
			value = element.props.value
		}

		const is_focused = !menu && value === focused_option_value

		let item_style

		// on overflow the vertical scrollbar will take up space
		// reducing padding-right and the only way to fix that
		// is to add additional padding-right
		//
		// a hack to restore padding-right taken up by a vertical scrollbar
		if (overflow && scrollbarPadding)
		{
			item_style = { marginRight: getScrollbarWidth() + 'px' }
		}

		let button

		// If a list of options is supplied as a set of child React elements,
		// then enhance those elements with extra props.
		if (element)
		{
			const extra_props =
			{
				style     : item_style ? { ...item_style, ...element.props.style } : element.props.style,
				className : classNames
				(
					'rrui__button-reset',
					'rrui__select__option',
					{
						'rrui__select__option--focused' : is_focused
					},
					element.props.className
				)
			}

			const onClick = element.props.onClick

			extra_props.onClick = (event) =>
			{
				if (menu)
				{
					// Collapse the `<Select/>`.
					this.onToggle(event)
				}
				else
				{
					this.item_clicked(value, event)
				}

				if (onClick)
				{
					onClick(event)
				}
			}

			button = React.cloneElement(element, extra_props)
		}
		// Else, if a list of options is supplied as an array of `{ value, label }`,
		// then transform those options to <buttons/>
		else
		{
			if (icon) {
				icon = render_icon(icon)
			}

			button = (
				<button
					type="button"
					onClick={ event => this.item_clicked(value, event) }
					disabled={ disabled }
					tabIndex="-1"
					aria-label={ label }
					className={ classNames
					(
						'rrui__button-reset',
						'rrui__select__option',
						{
							'rrui__select__option--focused' : is_focused,
							// CSS selector performance optimization
							'rrui__select__option--disabled' : disabled
						}
					) }
					style={ item_style }>
					{ icon &&
						React.cloneElement(icon,
						{
							className: classNames(icon.props.className, 'rrui__select__option-icon')
						})
					}
					<span className="rrui__select__option-label">
						{ label }
					</span>
				</button>
			)
		}

		return (
			<li
				key={ get_option_key(value) }
				ref={ ref => this.options_refs[get_option_key(value)] = ref }
				className={ classNames
				(
					'rrui__expandable__content',
					'rrui__select__options-list-item',
					{
						'rrui__select__separator-option' : element && element.type === Select.Separator,
						'rrui__expandable__content--expanded' : expanded,
						// CSS selector performance optimization
						'rrui__select__options-list-item--expanded' : expanded
					}
				) }>
				{ button }
			</li>
		)
	}

	// Renders the selected option
	// and possibly a transparent native `<select/>` above it
	// so that the native `<select/>` expands upon click
	// on the selected option
	// (in case of `nativeExpanded` setting).
	render_selected_item(label_is_shown)
	{
		const { nativeExpanded, toggler } = this.props

		if (toggler)
		{
			return this.render_toggler()
		}

		// `selected` can be just a button in a simple case
		// and an array of a button and an input in case of autocomplete.
		const selected = this.render_selected_item_only(label_is_shown)

		if (nativeExpanded)
		{
			return (
				<div style={ native_expanded_select_container_style }>
					{ this.render_static() }
					{ selected }
				</div>
			)
		}

		return selected
	}

	// Returns either just a button or a button and an input in case of autocomplete.
	// Always returns an array so that when `[input, button]` (collapsed)
	// becomes `[input]` (expanded) React doesn't re-mount the input element.
	// (won't focus the input upon expansion otherwise)
	render_selected_item_only(label_is_shown)
	{
		const
		{
			children,
			value,
			placeholder,
			label,
			disabled,
			required,
			autocomplete,
			concise,
			nativeExpanded,
			tabIndex,
			onFocus,
			title,
			ariaLabel,
			inputClassName,
			toggleClassName
		}
		= this.props

		const
		{
			expanded,
			autocomplete_width,
			autocomplete_input_value,
			isFetchingOptions,
			matches,
			selectedOptionLabel
		}
		= this.state

		const selected = this.get_selected_option()
		let selected_label = this.get_selected_option_label() || autocomplete && selectedOptionLabel

		const selected_text = selected_label ||
			// If an autocomplete has not been expanded yet
			// then show the placeholder.
			// (if no `value` is selected or until options are loaded).
			// After that, either show the selected option label
			// or show nothing.
			(autocomplete && isFetchingOptions && expanded !== undefined ? autocomplete_input_value : placeholder || label)

		const selected_style_classes =
		{
			'rrui__input-element' : true
		}

		const show_selected_as_an_icon = concise && selected && selected.icon

		const button = (
			<button
				key="button"
				ref={ this.storeSelectedOption }
				type="button"
				disabled={ disabled }
				onClick={ this.onToggle }
				onKeyDown={ this.onKeyDown }
				onFocus={ onFocus }
				tabIndex={ nativeExpanded ? -1 : tabIndex }
				title={ title }
				aria-label={ ariaLabel }
				className={ classNames
				(
					selected_style_classes,
					'rrui__button-reset',
					'rrui__select__button',
					toggleClassName,
					{
						'rrui__select__button--empty'   : !selected_label,
						'rrui__select__button--invalid' : this.should_indicate_invalid(),
						'rrui__input-element--invalid'  : this.should_indicate_invalid(),
						// CSS selector performance optimization
						// (should it even be optimized).
						'rrui__select__button--disabled' : disabled
					}
				) }>

				{/* http://stackoverflow.com/questions/35464067/flexbox-not-working-on-button-element-in-some-browsers */}
				<div className="rrui__select__selected-content">

					{/* Selected option label (or icon) */}
					<div
						className={ classNames('rrui__select__selected-label',
						{
							'rrui__select__selected-label--required' : !label_is_shown && required && value_is_empty(value)
						}) }>
						{ show_selected_as_an_icon ? React.cloneElement(render_icon(selected.icon), { title: selected_label }) : selected_text }
					</div>

					{/* An arrow */}
					{ !isFetchingOptions &&
						<div
							className={ classNames('rrui__select__arrow',
							{
								// CSS selector performance optimization
								'rrui__select__arrow--expanded' : expanded,
								'rrui__select__arrow--disabled' : disabled
							}) }/>
					}
				</div>
			</button>
		)

		if (autocomplete)
		{
			// style = { ...style, width: autocomplete_width + 'px' }

			const input = (
				<input
					key="input"
					type="text"
					ref={ this.storeAutocompleteInput }
					placeholder={ selected_label }
					value={ autocomplete_input_value }
					onChange={ this.on_autocomplete_input_change }
					onKeyDown={ this.onKeyDown }
					onFocus={ onFocus }
					tabIndex={ expanded ? tabIndex : -1 }
					title={ title }
					className={ classNames
					(
						selected_style_classes,
						'rrui__input-field',
						'rrui__select__autocomplete',
						inputClassName,
						// CSS selector performance optimization
						// (should it even be optimized).
						{
							'rrui__input-field--disabled' : disabled,
							'rrui__input-field--invalid' : !matches,
							'rrui__select__autocomplete--hidden' : !expanded,
							'rrui__select__autocomplete--loading' : isFetchingOptions
						}
					) }/>
			)

			if (expanded)
			{
				return [input]
			}

			return [input, button]
		}

		return [button]
	}

	render_toggler()
	{
		const { toggler } = this.props

		const properties =
		{
			ref       : this.storeSelectedOption,
			onClick   : this.onToggle,
			onKeyDown : this.onKeyDown
		}

		return (
			<div className="rrui__select__toggler">
				{ typeof toggler === 'function' ? React.createElement(toggler, properties) : React.cloneElement(toggler, properties) }
			</div>
		)
	}

	// supports disabled javascript
	render_static()
	{
		const
		{
			id,
			name,
			value,
			label,
			disabled,
			menu,
			toggler,
			fallback,
			native,
			nativeExpanded,
			tabIndex,
			children
		}
		= this.props

		const { options } = this.state

		if (menu)
		{
			return (
				<div
					className={ classNames
					({
						'rrui__rich__fallback' : fallback
					}) }>
					{toggler}
				</div>
			)
		}

		return (
			<select
				ref={ ref => this.native = ref }
				id={ id }
				name={ name }
				value={ value_is_empty(value) ? Empty_value_option_value : value }
				disabled={ disabled }
				onChange={ this.native_select_on_change }
				tabIndex={ (native || nativeExpanded) ? tabIndex : undefined }
				className={ classNames('rrui__input', 'rrui__select__native',
				{
					'rrui__select__native-expanded' : nativeExpanded,
					'rrui__rich__fallback'          : fallback
				}) }>
				{
					options
					?
					this.render_native_select_options(options, value_is_empty(value))
					:
					React.Children.map(children, (child) =>
					{
						if (!child)
						{
							return
						}

						return (
							<option
								className="rrui__select__native-option"
								key={ child.props.value }
								value={ child.props.value }>
								{ child.props.label }
							</option>
						)
					})
				}
			</select>
		)
	}

	render_native_select_options(options, empty_option_is_selected)
	{
		const { placeholder } = this.props

		let empty_option_present = false

		const rendered_options = options.map((option) =>
		{
			let { value, label } = option

			if (value_is_empty(value))
			{
				empty_option_present = true
				value = Empty_value_option_value
			}

			return (
				<option
					className="rrui__select__native-option"
					key={ get_option_key(value) }
					value={ value }>
					{ label }
				</option>
			)
		})

		if (empty_option_is_selected && !empty_option_present)
		{
			rendered_options.unshift
			(
				<option
					className="rrui__select__native-option"
					key={ get_option_key(undefined) }
					value="">
					{ placeholder }
				</option>
			)
		}

		return rendered_options
	}

	// Whether should indicate that the input value is invalid
	should_indicate_invalid()
	{
		const { indicateInvalid, error } = this.props

		return indicateInvalid && error
	}

	native_select_on_change = (event) =>
	{
		let value = event.target.value

		// Convert back from an empty string to `undefined`
		if (value === Empty_value_option_value)
		{
			// `null` is not accounted for, use `undefined` instead.
			value = undefined
		}

		this.setValue(value)
	}

	resize_native_expanded_select = () =>
	{
		// For some strange reason 1px on the right side of the `<select/>`
		// still falls through to the underlying selected option label.
		this.native.style.width = (this.selected.offsetWidth + 1) + 'px'
	}

	refreshSelectedOptionLabel(value = this.props.value, options = this.state.options)
	{
		const label = getSelectedOptionLabel(value, options)
		if (label)
		{
			this.setState({
				selectedOptionLabel : label
			})
		}
	}

	get_selected_option()
	{
		const { value } = this.props

		return this.get_option(value)
	}

	get_option(value)
	{
		const { children } = this.props
		const { options } = this.state

		if (!children)
		{
			return options.filter(x => x.value === value)[0]
		}

		let option

		React.Children.forEach(children, function(child)
		{
			if (child.props.value === value)
			{
				option = child
			}
		})

		return option
	}

	get_option_index(option)
	{
		const { children } = this.props
		const { options } = this.state

		if (!children)
		{
			return options.indexOf(option)
		}

		let option_index

		React.Children.forEach(children, function(child, index)
		{
			if (child.props.value === option.value)
			{
				option_index = index
			}
		})

		return option_index
	}

	get_selected_option_label()
	{
		const { children } = this.props
		const { options } = this.state

		const selected = this.get_selected_option()

		if (!selected)
		{
			return
		}

		if (!children)
		{
			return selected.label
		}

		return selected.props.label
	}

	overflown()
	{
		const { maxItems } = this.props
		const { options } = this.state

		return options.length > maxItems
	}

	getCurrentlyDisplayedOptions()
	{
		const { maxItems } = this.props
		let { options, expanded } = this.state

		options = this.trimOptions(options)

		if (!expanded)
		{
			options = options.slice(0, maxItems)
		}

		return options
	}

	scrollable_list_height(height, vertical_padding)
	{
		const { maxItems } = this.props

		// (Adding vertical padding so that it shows these `maxItems` options fully)
		return (height - 2 * vertical_padding) * (maxItems / this.getCurrentlyDisplayedOptions().length) + vertical_padding
	}

	should_animate()
	{
		return true

		// return this.props.options.length >= this.props.transition_item_count_min
	}

	focus()
	{
		if (this.autocomplete)
		{
			focus(this.autocomplete)
		}
		else
		{
			focus(this.selected)
		}
	}

	onToggle = (event) =>
	{
		const { autocomplete } = this.props
		const { expanded } = this.state

		// Don't navigate away when clicking links
		event.preventDefault()

		if (!expanded && autocomplete)
		{
			// Focus the input after the select is expanded.
			this.autocomplete.focus()
		}

		// Not discarding the click event because
		// other expanded selects may be listening to it.
		// // Discard the click event so that it won't reach `document` click listener
		// event.stopPropagation() // doesn't work
		// event.nativeEvent.stopImmediatePropagation()

		// Deferring expanding this `<Select/>` upon click
		// because `document`'s `onClick` listener should fire first,
		// otherwise, if `document`'s `onClick` listener fired after `this.toggle()`
		// then `event.target` in that listener would be detached from the document
		// (e.g. in case of autocomplete: the `<button/>` would be replaced with an `<input/>`),
		// and therefore the click won't be detected as belonging to this `<Select/>`
		// and because of that `this.onDocumentClick()` handler will immediately toggle
		// this `<Select/>` back to collapsed state.
		// `this.onToggle(event)` should be called instead of
		// directly `this.toggle()` on any toggling click.
		clearTimeout(this.toggle_timeout)
		this.toggle_timeout = setTimeout(() => this.toggle({ timeout: true }), 0)
	}

	toggle = (options = {}) =>
	{
		const
		{
			menu,
			autocomplete,
			disabled,
			nativeExpanded,
			onToggle
		}
		= this.props

		const { isFetchingOptions } = this.state

		const expanded = options.expanded !== undefined ? options.expanded : this.state.expanded

		if (nativeExpanded || disabled)
		{
			return
		}

		// If clicked on the toggler the second time
		// while options are already being fetched
		// then wait for the fetch to finish first.
		if (isFetchingOptions && !expanded)
		{
			return
		}

		clearTimeout(this.scroll_into_view_timeout)
		clearTimeout(this.restore_focus_on_collapse_timeout)

		// if (!expanded && autocomplete)
		// {
		// 	this.setState
		// 	({
		// 		// The input value can't be `undefined`
		// 		// because in that case React would complain
		// 		// about it being an "uncontrolled input"
		// 		autocomplete_input_value : '',
		// 		matching_options         : options
		// 	})
		//
		// 	// if (!this.state.autocomplete_width)
		// 	// {
		// 	// 	this.setState({ autocomplete_width: this.get_widest_label_width() })
		// 	// }
		// }

		if (onToggle) {
			onToggle(!expanded)
		}

		if (expanded)
		{
			this._toggle(false, options)
		}
		else
		{
			this.fetchOptions(() =>
			{
				// Toggling the options list in a timeout
				// in order for iOS scroll not to get "janky"
				// when `<Select autocomplete/>` gets focused.
				// (for some unknown reason)
				// `100` ms is an imperical value.
				//
				// Asynchronous `getOptions()` introduce a delay already
				// so only adding a delay for synchronous autocomplete.
				//
				if (autocomplete && this.props.options)
				{
					setTimeout(() => this._toggle(true, options), 100)
				}
				else
				{
					// Asynchronous `getOptions()` introduce a delay already.
					this._toggle(true, options)
				}
			})
		}
	}

	_toggle(expand, { timeout, refocus })
	{
		const { autocomplete, focusUponSelection } = this.props

		if (expand && autocomplete && !timeout)
		{
			// Focus the input after the select is expanded.
			this.autocomplete.focus()
		}

		this.setState
		({
			expanded : expand,

			// The input value can't be `undefined`
			// because in that case React would complain
			// about it being an "uncontrolled input".
			autocomplete_input_value : ''
			// autocomplete_input_value : this.get_selected_option_label() || ''
		},
		() =>
		{
			if (!(expand && autocomplete))
			{
				if (focusUponSelection && refocus !== false)
				{
					// Focus the toggler after the select is collapsed.
					// Can be a DOM Element or a custom React Component.
					focus(this.selected)

					// For some reason Firefox loses focus
					// upon select expansion via a click,
					// so this extra `focus()` works around that issue.
				}
			}

			if (expand)
			{
				this.afterExpand()
			}
		})
	}

	afterExpand()
	{
		const
		{
			scrollIntoView,
			expandAnimationDuration,
			keyboardSlideAnimationDuration
		}
		= this.props

		// Highlight either the option for the currently
		// selected `value` or the first option available.
		this.focusAnOption()

		// For some reason in IE 11 "scroll into view" scrolls
		// to the top of the page, therefore turn it off for IE.
		if (!isInternetExplorer() && scrollIntoView)
		{
			this.scroll_into_view_timeout = setTimeout(() =>
			{
				// If still expanded and there are any options
				// then scroll into view.
				if (this.state.expanded && this.list) {
					scrollIntoViewIfNeeded(this.list)
				}
			},
			Math.max(expandAnimationDuration, keyboardSlideAnimationDuration) * 1.1)
		}
	}

	focusAnOption = () =>
	{
		const { autocomplete } = this.props
		const { options } = this.state

		if (options.length > 0)
		{
			// Focus either the selected option
			// or the first option in the list.

			const selected_option = !autocomplete && this.get_selected_option()

			const focused_option_value = selected_option ? selected_option.value : options[0].value

			this.setState({ focused_option_value })

			// Scroll down to the focused option
			this.scroll_to(focused_option_value)
		}
	}

	setValue(value)
	{
		const { autocomplete, onChange } = this.props
		const { options } = this.state

		// Call `onChange` only if the `value` did change.
		if (value !== this.props.value) {
			onChange(value)
		}

		if (autocomplete) {
			this.refreshSelectedOptionLabel(value)
		}
	}

	item_clicked = (value, event) =>
	{
		// Collapse the `<Select/>`.
		this.onToggle(event)

		this.setValue(value)
	}

	onDocumentClick = (event) =>
	{
		// Don't close the select if its expander button has been clicked,
		// or if autocomplete has been clicked,
		// or if an option was selected from the list.
		if (!this.select.contains(event.target))
		{
			this.toggle({ expanded: true, refocus: false })
		}
	}

	// Would have used `onBlur={...}` event handler here
	// with `if (container.contains(event.relatedTarget))` condition,
	// but it doesn't work in IE in React.
	// https://github.com/facebook/react/issues/3751
	//
	// Therefore, using the hacky `document.onClick` handlers
	// and this `onKeyDown` Tab handler
	// until `event.relatedTarget` support is consistent in React.
	//
	on_key_down_in_container = (event) =>
	{
		if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey)
		{
			return
		}

		const { expanded } = this.state

		switch (event.keyCode)
		{
			// Toggle on Tab out
			case 9:
				if (expanded)
				{
					this.toggle()

					const { onTabOut } = this.props

					if (onTabOut)
					{
						onTabOut(event)
					}
				}
				return
		}
	}

	onKeyDown = (event) =>
	{
		const { onKeyDown, value, autocomplete } = this.props
		const { options, expanded, focused_option_value } = this.state

		if (onKeyDown)
		{
			onKeyDown(event)
		}

		if (submitFormOnCtrlEnter(event, this.autocomplete || this.selected))
		{
			return
		}

		if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey)
		{
			return
		}

		// Maybe add support for `children` arrow navigation in future
		if (options.length > 0)
		{
			switch (event.keyCode)
			{
				// "Up" arrow.
				// Select the previous option (if present).
				case 38:
					event.preventDefault()

					const previous = this.previous_focusable_option()

					if (previous)
					{
						this.show_option(previous.value, 'top')
						return this.setState({ focused_option_value: previous.value })
					}

					return

				// "Down" arrow.
				// Select the next option (if present).
				case 40:
					event.preventDefault()

					const next = this.next_focusable_option()

					if (next)
					{
						this.show_option(next.value, 'bottom')
						return this.setState({ focused_option_value: next.value })
					}

					return

				// "Escape".
				//
				// Collapse.
				//
				// Maybe add this kind of support for "Escape" key in some future:
				//  hiding the item list, cancelling current item selection process
				//  and restoring the selection present before the item list was toggled.
				//
				case 27:
					// Collapse the list if it's expanded
					if (this.state.expanded)
					{
						this.toggle()

						// Restore focus when the list is collapsed.
						clearTimeout(this.restore_focus_on_collapse_timeout)
						this.restore_focus_on_collapse_timeout = setTimeout(() => focus(this.selected), 0)
					}

					return

				// "Enter".
				case 13:
					// Choose the focused item on Enter
					if (expanded)
					{
						// If an item is focused
						// (which may not be the case
						//  when autocomplete is matching no items)
						// (still for non-autocomplete select
						//  it is valid to have a default option)
						if (options.length > 0)
						{
							// Choose the focused item
							this.item_clicked(focused_option_value, event)
						}
					}
					// Else it should have just submitted the form on Enter,
					// but it wouldn't because the select element activator is a <button/>
					// therefore hitting Enter while being focused on it just pushes that button.
					// So submit the enclosing form manually.
					else
					{
						if (submitContainingForm(this.select))
						{
							event.preventDefault()
						}
					}

					return

				// "Spacebar".
				case 32:
					// Choose the focused item on Enter
					if (expanded)
					{
						// only if it it's an `options` select
						// and also if it's not an autocomplete
						if (options.length > 0 && !autocomplete)
						{
							// `focused_option_value` could be non-existent
							// in case of `autocomplete`, but since
							// we're explicitly not handling autocomplete here
							// it is valid to select any options including the default ones.
							this.item_clicked(focused_option_value, event)
						}
					}
					// Otherwise, the spacebar keydown event on a `<button/>`
					// will trigger `onClick` and `.toggle()` will be called.

					return
			}
		}
	}

	// This handler is a workaround for `redux-form`
	on_blur = (event) =>
	{
		const { onBlur, value } = this.props

		// If clicked on a select option then don't trigger "blur" event
		if (event.relatedTarget && event.currentTarget.contains(event.relatedTarget))
		{
			return
		}

		// This `onBlur` interceptor is a workaround for `redux-form`,
		// so that it gets the right (parsed, not the formatted one)
		// `event.target.value` in its `onBlur` handler.
		if (onBlur)
		{
			const _event =
			{
				...event,
				target:
				{
					...event.target,
					value
				}
			}

			// For `redux-form` event detection.
			// https://github.com/erikras/redux-form/blob/v5/src/events/isEvent.js
			_event.stopPropagation = event.stopPropagation
			_event.preventDefault  = event.preventDefault

			onBlur(_event)
		}
	}

	trimOptions(options)
	{
		const
		{
			autocomplete,
			autocompleteShowAll,
			maxItems
		}
		= this.props

		if (!autocomplete)
		{
			return options
		}

		if (autocompleteShowAll)
		{
			return options
		}

		return options.slice(0, maxItems)
	}

	throttleFetchOptionsCall(callback)
	{
		let
		{
			throttle,
			minCharactersToStartThrottling
		}
		= this.props

		const { autocomplete_input_value } = this.state

		const wait = throttle - (Date.now() - this.latestFetchOptionsCallTimestamp)

		if (autocomplete_input_value.length >= minCharactersToStartThrottling && wait > 0)
		{
			if (!this.nextFetchOptionsCallTimeout)
			{
				this.nextFetchOptionsCallTimeout = setTimeout(() =>
				{
					this.nextFetchOptionsCallTimeout = undefined
					this.latestFetchOptionsCall()
				},
				wait)
			}

			this.latestFetchOptionsCall = () => this.fetchOptions(callback)
			return true
		}
	}

	fetchOptions(callback = () => {})
	{
		let
		{
			menu,
			autocomplete,
			options,
			getOptions
		}
		= this.props

		const
		{
			async,
			autocomplete_input_value
		}
		= this.state

		if (menu) {
			return callback()
		}

		// If throttled then schedule a future invocation.
		// The first invocation happens inside `componentDidMount()`
		// and that's where `this.async` flag is set.
		if (async && this.throttleFetchOptionsCall(callback)) {
			return
		}

		this.latestFetchOptionsCallTimestamp = Date.now()

		options = _getOptions(options, getOptions, autocomplete_input_value)

		if (Array.isArray(options))
		{
			if (!autocomplete) {
				return this.setState({ options }, callback)
			}

			if (options.length === 0) {
				return this.setState({ matches: false }, callback)
			}

			return this.setState
			({
				matches : true,
				options // : this.trimOptions(options)
			},
			() =>
			{
				if (autocomplete) {
					this.refreshSelectedOptionLabel()
				}
				callback()
			})
		}

		if (typeof options.then === 'function')
		{
			const counter = this.counter.getNextCounter()

			this.setState
			({
				async : true,
				isFetchingOptions : true,
				fetchingOptionsCounter : counter
			},
			() =>
			{
				options.then((options) =>
				{
					this.receiveOptions(options, counter, callback)
				},
				(error) =>
				{
					console.error(error)
					this.receiveOptions([], counter, callback)
				})
			})
		}
	}

	receiveOptions(options, counter, callback)
	{
		const { autocomplete } = this.props

		const newState = {}

		// Update matching state.
		if (autocomplete)
		{
			// Can only override "older" matching state.
			if (isCounterAfter(counter, this.state.matchesCounter))
			{
				newState.matches = options.length > 0
				newState.matchesCounter = counter
			}
		}

		// Update options.
		// Can only override "older" options.
		// (not "newer" ones)
		if (isCounterAfter(counter, this.state.optionsCounter))
		{
			if (autocomplete)
			{
				// Autocomplete should always display some options.
				if (options.length > 0)
				{
					newState.options = options // this.trimOptions(options)
					newState.optionsCounter = counter
				}
			}
			else
			{
				newState.options = options
			}
		}

		if (counter === this.state.fetchingOptionsCounter)
		{
			newState.isFetchingOptions = false
			newState.fetchingOptionsCounter = undefined
		}

		this.setState(newState, () =>
		{
			if (autocomplete) {
				this.refreshSelectedOptionLabel()
			}
			callback()
		})
	}

	// Get the previous option (relative to the currently focused option)
	previous_focusable_option()
	{
		const { options } = this.state
		const { focused_option_value } = this.state

		let i = 0
		while (i < options.length)
		{
			if (options[i].value === focused_option_value)
			{
				if (i - 1 >= 0)
				{
					return options[i - 1]
				}
			}
			i++
		}
	}

	// Get the next option (relative to the currently focused option)
	next_focusable_option()
	{
		let { options } = this.state
		const { focused_option_value } = this.state

		options = this.trimOptions(options)

		let i = 0
		while (i < options.length)
		{
			if (options[i].value === focused_option_value)
			{
				if (i + 1 < options.length)
				{
					return options[i + 1]
				}
			}
			i++
		}
	}

	// Scrolls to an option having the value.
	scroll_to(value)
	{
		const { vertical_padding } = this.state

		const option_element = this.options_refs[get_option_key(value)]

		// If this option isn't even shown
		// (e.g. autocomplete)
		// then don't scroll to it because there's nothing to scroll to.
		if (!option_element)
		{
			return
		}

		let offset_top = option_element.offsetTop

		const is_first_option = this.list.firstChild === option_element

		// If it's the first one - then scroll to list top
		if (is_first_option)
		{
			offset_top -= vertical_padding
		}

		this.list.scrollTop = offset_top
	}

	// Fully shows an option having the `value` (scrolls to it if neccessary)
	show_option(value, gravity)
	{
		const { vertical_padding } = this.state

		const option_element = this.options_refs[get_option_key(value)]

		const is_first_option = this.list.firstChild === option_element
		const is_last_option  = this.list.lastChild === option_element

		switch (gravity)
		{
			case 'top':
				let top_line = option_element.offsetTop

				if (is_first_option)
				{
					top_line -= vertical_padding
				}

				if (top_line < this.list.scrollTop)
				{
					this.list.scrollTop = top_line
				}

				return

			case 'bottom':
				let bottom_line = option_element.offsetTop + option_element.offsetHeight

				if (is_last_option)
				{
					bottom_line += vertical_padding
				}

				if (bottom_line > this.list.scrollTop + this.list.offsetHeight)
				{
					this.list.scrollTop = bottom_line - this.list.offsetHeight
				}

				return
		}
	}

	// Calculates height of the expanded item list
	calculate_height()
	{
		const { options } = this.state

		// const border = parseInt(window.getComputedStyle(this.list).borderTopWidth)
		const height = this.list.scrollHeight
		const vertical_padding = parseInt(window.getComputedStyle(this.list).paddingTop)

		// For things like "accordeon".
		//
		// const images = this.list.querySelectorAll('img')
		//
		// if (images.length > 0)
		// {
		// 	return this.preload_images(this.list, images)
		// }

		const state = { height, vertical_padding }

		// If it's a regular `<select/>` with `<option/>`s
		// then calculate its height.
		if (this.is_scrollable() && options.length > 0 && this.overflown())
		{
			state.list_height = this.scrollable_list_height(height, vertical_padding)
		}

		this.setState(state)
	}

	is_scrollable()
	{
		const
		{
			menu,
			autocomplete,
			autocompleteShowAll,
			scroll
		}
		= this.props

		return !menu && (autocomplete && autocompleteShowAll || !autocomplete) && scroll
	}

	// This turned out not to work for `autocomplete`
	// because not all options are ever shown.
	// get_widest_label_width()
	// {
	// 	// <ul/> -> <li/> -> <button/>
	// 	const label = this.list.firstChild.firstChild
	//
	// 	const style = getComputedStyle(label)
	//
	// 	const width = parseFloat(style.width)
	// 	const side_padding = parseFloat(style.paddingLeft)
	//
	// 	return width - 2 * side_padding
	// }

	on_autocomplete_input_change = (event) =>
	{
		const { expanded } = this.state

		if (!expanded)
		{
			return event.preventDefault()
		}

		this.setState
		({
			autocomplete_input_value: event.target.value
		},
		() =>
		{
			this.fetchOptions(this.focusAnOption)
		})
	}
}

Select.Separator = function()
{
	return <div className="rrui__select__separator"/>
}

const native_expanded_select_container_style =
{
	display : 'inline-block'
}

// There can be an `undefined` value,
// so just `{ value }` won't do here.
function get_option_key(value)
{
	return value_is_empty(value) ? '@@rrui/select/undefined' : value
}

function value_is_empty(value)
{
	return value === null || value === undefined
}

/**
 * Focuses on a React component (if any).
 * @param  {?object} component
 */
function focus(component)
{
	// If the component has been already unmounted.
	// (safety)
	if (!component) {
		return
	}

	if (typeof component.focus === 'function') {
		return component.focus()
	}
}

function render_icon(icon)
{
	return typeof icon === 'function' ? icon() : icon
}

class Counter
{
	counter = 0

	getNextCounter()
	{
		if (this.counter < MAX_SAFE_INTEGER) {
			this.counter++
		} else {
			this.counter = 1
		}
		return this.counter
	}
}

const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1

// Can only override "older" options.
// (not "newer" ones)
function isCounterAfter(counter, currentStateCounter)
{
	const diff = counter - currentStateCounter

	// If the new options are "newer" than the current ones,
	// then they can override them.
	// (also accounts for counter overflow)
	return diff > 0 || (diff < 0 && Math.abs(diff) > MAX_SAFE_INTEGER / 2)
}

function getSelectedOptionLabel(value, options)
{
	const selected = options.filter(_ => _.value === value)[0]
	if (selected) {
		return selected.label
	}
}

function get_matching_options(options, value)
{
	// If the autocomplete value is `undefined` or empty
	if (!value) {
		return options
	}

	value = value.toLowerCase()

	return options.filter(({ label, verbose }) => {
		return (verbose || label).toLowerCase().indexOf(value) >= 0
	})
}

function _getOptions(options, getOptions, autocomplete_input_value)
{
	if (options)
	{
		return options && get_matching_options(options, autocomplete_input_value)
	}

	if (getOptions)
	{
		return getOptions(autocomplete_input_value)
	}
}