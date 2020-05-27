const express = require('express')
const router = express.Router()

const NotFoundError = require('../errors/NotFoundError')

module.exports = function (displayService) {
  /**
   * @swagger
   * definitions:
   *   Display:
   *     type: object
   *     required:
   *     - name
   *     properties:
   *       id:
   *         type: number
   *         readOnly: true
   *       name:
   *         type: string
   *       active:
   *         type: boolean
   *         default: false
   *       clientId:
   *         type: string
   *         default: ''
   *       description:
   *         type: string
   *         default: ''
   *       location:
   *         type: string
   *         default: ''
   *
   *   View:
   *     type: object
   *     required:
   *     - columns
   *     - rows
   *     - screenType
   *     properties:
   *       id:
   *         type: number
   *         readOnly: true
   *       columns:
   *         type: number
   *         minimum: 1
   *       rows:
   *         type: number
   *         minimum: 1
   *       displayId:
   *         type: number
   *         readOnly: true
   *       order:
   *         type: number
   *         readOnly: true
   *       screenType:
   *         type: string
   *       contentSlots:
   *         type: array
   *         items:
   *           $ref: '#/definitions/ContentSlot'
   *
   *   ContentSlot:
   *     type: object
   *     required:
   *       - componentType
   *       - columnStart
   *       - rowStart
   *       - columnEnd
   *       - rowEnd
   *     properties:
   *       componentType:
   *         type: string
   *         enum:
   *         - AnnouncementList
   *         - Clock
   *         - DWDWarningMap
   *       viewId:
   *         type: number
   *         readOnly: true
   *       columnStart:
   *         type: number
   *       rowStart:
   *         type: number
   *       columnEnd:
   *         type: number
   *       rowEnd:
   *         type: number
   *       options:
   *         type: object
   */

  /**
   * @swagger
   * /api/v1/displays/:
   *   get:
   *     summary: Returns all Displays
   *     produces: application/json
   *     responses:
   *       200:
   *         description: All available Displays
   *         schema:
   *           type: array
   *           items:
   *             $ref: '#/definitions/Display'
   *     tags:
   *       - Displays
   */
  router.get('/', async (req, res, next) => {
    try {
      const displays = await displayService.getAllDisplays()
      res.json(displays)
    } catch (e) {
      return next(e)
    }
  })

  /**
   * @swagger
   * /api/v1/displays/:
   *   post:
   *     summary: Create a new Display
   *     produces: application/json
   *     parameters:
   *       - name: display
   *         in: body
   *         required: true
   *         description: Fields for the Display resource
   *         schema:
   *           $ref: '#/definitions/Display'
   *     responses:
   *       201:
   *         description: The newly created Display
   *         schema:
   *           $ref: '#/definitions/Display'
   *         headers:
   *           Location:
   *             description: The URI of the newly created Display resource
   *             type: string
   *     tags:
   *       - Displays
   */
  router.post('/', async (req, res, next) => {
    try {
      const display = await displayService.createDisplay(
        req.body.name,
        req.body.active || false,
        req.body.clientId || '',
        req.body.description || '',
        req.body.location || ''
      )
      const baseUrl = req.originalUrl.replace(/\/$/, '')
      const newLocation = `${baseUrl}/${display.id}`
      res.set('Location', newLocation).status(201).json(display)
    } catch (e) {
      return next(e)
    }
  })

  /**
   * @swagger
   * /api/v1/displays/{id}:
   *   get:
   *     summary: Returns a single Display
   *     produces: application/json
   *     parameters:
   *       - name: id
   *         in: path
   *         type: number
   *     responses:
   *       200:
   *         description: The Display model
   *         schema:
   *           $ref: '#/definitions/Display'
   *       404:
   *         description: The Display could not be found
   *     tags:
   *       - Displays
   */
  router.get('/:id', async (req, res, next) => {
    try {
      const display = await displayService.getDisplayById(parseInt(req.params.id))
      if (!display) {
        next(new NotFoundError(`No Display with ID ${req.params.id} found`))
        return
      }
      res.json(display)
    } catch (e) {
      next(e)
    }
  })

  /**
   * @swagger
   * /api/v1/displays/{id}:
   *   put:
   *     summary: Updates a single Display
   *     produces: application/json
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         type: number
   *       - name: display
   *         in: body
   *         description: Fields for the Display resource
   *         schema:
   *           $ref: '#/definitions/Display'
   *     responses:
   *       200:
   *         description: Successfully updated
   *         schema:
   *           $ref: '#/definitions/Display'
   *       404:
   *         description: Display does not exist and cannot be updated. Please use POST to create a new Display
   *     tags:
   *       - Displays
   */
  router.put('/:id', async (req, res, next) => {
    try {
      const updatedDisplay = await displayService.updateDisplay(parseInt(req.params.id), req.body.name, req.body.active, req.body.clientId, req.body.description, req.body.location)
      if (!updatedDisplay) {
        next(new NotFoundError(`No Display with ID ${req.params.id} found`))
        return
      }
      res.json(updatedDisplay)
    } catch (e) {
      next(e)
    }
  })

  /**
   * @swagger
   * /api/v1/displays/{id}:
   *   delete:
   *     summary: Deletes a single Display
   *     produces: application/json
   *     parameters:
   *       - name: id
   *         in: path
   *         type: string
   *     responses:
   *       204:
   *         description: Successfully deleted
   *     tags:
   *       - Displays
   */
  router.delete('/:id', async (req, res, next) => {
    try {
      await displayService.deleteDisplay(parseInt(req.params.id))
      res.sendStatus(204)
    } catch (e) {
      return next(e)
    }
  })

  /**
   * @swagger
   * /api/v1/displays/{id}/views:
   *   get:
   *     summary: Returns all Views for a Display
   *     produces: application/json
   *     parameters:
   *       - name: id
   *         in: path
   *         description: The ID of the Display
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: All available Views for this Displays
   *         schema:
   *           type: array
   *           items:
   *             $ref: '#/definitions/View'
   *     tags:
   *       - Views
   */
  router.get('/:id/views', (req, res, next) => {
    displayService.getDisplayById(parseInt(req.params.id))
      .then(display => {
        // Display exists
        return displayService.getViewsForDisplay(display.id)
          .then(views => res.json(views))
      })
      .catch(reason => next(reason))
  })

  /**
   * @swagger
   * /api/v1/displays/{id}/views:
   *   post:
   *     summary: Adds a new View to a Display
   *     produces: application/json
   *     parameters:
   *       - name: id
   *         in: path
   *         description: The ID of the Display
   *         required: true
   *         type: number
   *       - name: view
   *         in: body
   *         required: true
   *         description: Fields for the View resource
   *         schema:
   *           $ref: '#/definitions/View'
   *     responses:
   *       201:
   *         description: The newly created View
   *         schema:
   *           $ref: '#/definitions/View'
   *         headers:
   *           Location:
   *             description: The URI of the newly created View resource
   *             type: string
   *     tags:
   *       - Views
   */
  router.post('/:id/views', (req, res, next) => {
    displayService.getDisplayById(parseInt(req.params.id))
      .then(display => {
        // Display exists
        return displayService.createView(display.id, req.body.screenType, req.body.columns, req.body.rows)
          .then(view => {
            const baseUrl = req.originalUrl.replace(/\/$/, '')
            const newLocation = `${baseUrl}/${display.id}/views/${view.id}`
            res.set('Location', newLocation).status(201).json(view)
          })
      })
      .catch(reason => next(reason))
  })

  /**
   * @swagger
   * /api/v1/displays/{displayId}/view/{viewId}:
   *   get:
   *     summary: Returns a single View of a specific Display
   *     produces: application/json
   *     parameters:
   *       - name: displayId
   *         in: path
   *         description: The ID of the Display
   *         type: number
   *       - name: viewId
   *         in: path
   *         description: The ID of the View
   *         type: number
   *     responses:
   *       200:
   *         description: The View model
   *         schema:
   *           $ref: '#/definitions/View'
   *       404:
   *         description: The View could not be found. It can also mean that the Display does not exist.
   *     tags:
   *       - Views
   */
  router.get('/:id/views/:viewId', (req, res, next) => {
    displayService.getDisplayById(parseInt(req.params.id))
      .then(display => {
        // Display exists
        return displayService.getView(parseInt(req.params.viewId))
          .then(view => {
            if (view.displayId !== display.id) {
              throw new NotFoundError(`The Display ${display.id} does not have a View with ID ${view.id}`)
            }
            res.json(view)
          })
      })
      .catch(reason => next(reason))
  })

  /**
   * @swagger
   * /api/v1/displays/{displayId}/view/{viewId}:
   *   put:
   *     summary: Updates a single View of a Display
   *     produces: application/json
   *     parameters:
   *       - name: displayId
   *         in: path
   *         description: The ID of the Display
   *         type: number
   *       - name: viewId
   *         in: path
   *         description: The ID of the View
   *         type: number
   *       - name: view
   *         in: body
   *         description: Fields for the View resource
   *         schema:
   *           $ref: '#/definitions/View'
   *     responses:
   *       200:
   *         description: Successfully updated
   *         schema:
   *           $ref: '#/definitions/View'
   *       404:
   *         description: A View (or Display) with that ID does not exist and cannot be updated. Please use POST to add a View.
   *     tags:
   *       - Views
   */
  router.put('/:id/views/:viewId', (req, res, next) => {
    displayService.getDisplayById(parseInt(req.params.id))
      .then(display => {
        // Display exists
        return displayService.getView(parseInt(req.params.viewId))
          .then(view => {
            if (view.displayId !== display.id) {
              throw new NotFoundError(`The Display ${display.id} does not have a View with ID ${view.id}`)
            }

            return displayService.updateView(view.id, req.body.columns, req.body.rows, req.body.contentSlots)
          })
      })
      .then(updatedView => res.json(updatedView))
      .catch(reason => next(reason))
  })

  /**
   * @swagger
   * /api/v1/displays/{displayId}/view/{viewId}:
   *   delete:
   *     summary: Removes a single View from a Display
   *     produces: application/json
   *     parameters:
   *       - name: displayId
   *         in: path
   *         description: The ID of the Display
   *         type: number
   *       - name: viewId
   *         in: path
   *         description: The ID of the View
   *         type: number
   *     responses:
   *       204:
   *         description: Successfully deleted
   *     tags:
   *       - Views
   */
  router.delete('/:id/views/:viewId', (req, res, next) => {
    displayService.getView(parseInt(req.params.viewId))
      .then(view => {
        if (view.displayId !== parseInt(req.params.id)) {
          // The View that is supposed to be deleted does not belong to this Display, so reply nicely but don't delete
          return Promise.resolve()
        }

        return displayService.deleteView(parseInt(req.params.viewId))
      })
      .then(() => res.sendStatus(204))
      .catch(reason => next(reason))
  })

  return router
}
