import scrollIntoViewIfNeededPolyfill from 'scroll-into-view-if-needed'

// Submits the form on `Ctrl` + `Enter` (or `Cmd` + `Enter`).
export function submitFormOnCtrlEnter(event, component)
{
	if ((event.ctrlKey || event.metaKey) && event.keyCode === 13)
	{
		if (submitContainingForm(component))
		{
			event.preventDefault()
			return true
		}
	}
}

export function submitContainingForm(node)
{
	while (node.parentElement)
	{
		node = node.parentElement
		if (node instanceof HTMLFormElement)
		{
			// Won't use `node.submit()` because it bypasses `onSubmit`.
			// Will click the submit button instead.
			const submit = node.querySelector('button[type=submit]')
			if (submit)
			{
				submit.click()
				return true
			}
		}
	}
}

export function getScrollbarWidth()
{
	// // `window.innerWidth` has a bug:
	// // it's decreases as the page scale is increased.
	// // Therefore not using it.
	// // (Full width) - (Width minus scrollbar)
	// return document.body.clientWidth - window.innerWidth

	return 17
}

// Detects Internet Explorer.
// https://stackoverflow.com/questions/19999388/check-if-user-is-using-ie-with-jquery
export function isInternetExplorer()
{
	return window.navigator.userAgent.indexOf('MSIE ') > 0 ||
		window.navigator.userAgent.indexOf('Trident/') > 0
}

export function scrollIntoViewIfNeeded(element, duration = 300)
{
	// https://developer.mozilla.org/ru/docs/Web/API/Element/scrollIntoViewIfNeeded
	if (element.scrollIntoViewIfNeeded)
	{
		element.scrollIntoViewIfNeeded(false)
	}
	else
	{
		// https://github.com/stipsan/scroll-into-view-if-needed
		scrollIntoViewIfNeededPolyfill(element, { centerIfNeeded : false, duration })
	}
}