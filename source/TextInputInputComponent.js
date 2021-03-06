import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import Input from './TextInputInput'
import Label from './TextInputLabel'

// `<input/>` and its `<label/>`.
export default function TextInput(props)
{
	const
	{
		id,
		value,
		required,
		floatingLabel,
		label,
		multiline,
		error,
		indicateInvalid,
		containerRef,
		children
	}
	= props

	return (
		<div
			ref={ containerRef }
			className={ classNames('rrui__input',
			{
				'rrui__input--multiline' : multiline,
			}) }>

			{/* `<input/>` */}
			<Input {...props}/>

			{/* Input `<label/>`. */}
			{/* It is rendered after the input to utilize the
		       `input:focus + label` CSS selector rule */}
			{ label &&
				<Label
					id={ id }
					value={ value }
					required={ required }
					invalid={ indicateInvalid && error }
					floats={ floatingLabel }>
					{ label }
				</Label>
			}

			{children}
		</div>
	)
}

TextInput.propTypes =
{
	// Set to `true` to mark the field as required.
	required : PropTypes.bool.isRequired,

	// Labels float by default.
	floatingLabel : PropTypes.bool.isRequired
}

TextInput.defaultProps =
{
	// Set to `true` to mark the field as required.
	required : false,

	// Labels float by default.
	floatingLabel : true
}