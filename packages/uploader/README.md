# Uploader

The processing and queuing engine.
The Uploader creates batches from the files passed to it for upload. 
It will handle the processing and send the files to be uploaded to the server.
Uploader fires Batch & BatchItem lifecycle [events](#events) that can be listened to as well cancel uploads dynamically. 


## Installation

```shell
   $ yarn add @rpldy/uploader
``` 

Or 

```shell
   $ npm i @rpldy/uploader
```

## Usage

When in React, you don't need to use this package directly. Uploady will take care of initialization and other aspects (ie: event registration) for you.
In case you want to create your own uploader instance, you can do it like so:

```javascript
import createUploader, { UPLOADER_EVENTS } from "@rpldy/uploader";

const uploader = createUploader({ 
    autoUpload: false,
    grouped: true,
    //...
});

uploader.on(UPLOADER_EVENTS.ITEM_START, (item) => {
     console.log(`item ${item.id} started uploading`);  
});

uploader.add(myFile);

```

## Upload Options

| Name (* = mandatory) | Type          | Default       | Description  
| --------------       | ------------- | ------------- | -------------
| autoUpload           | boolean       | true          | automatically upload files when they are added 
| destination          | [Destination](../../shared/src/types.js#L7)   | undefined     | configure the end-point to upload to
| inputFieldName       | string        | "file"        | name (attribute) of the file input field
| grouped              | boolean       | false         | group multiple files in a single request 
| maxGroupSize         | number        | 5             | maximum of files to group together in a single request 
| formatGroupParamName | (number, string) => string | undefined | determine the upload request field name when more than file is grouped in a single upload
| fileFilter           | (File &#124; string) => boolean | undefined | return false to exclude from batch
| method               | string        | "POST"        | HTTP method in upload request
| params               | Object        | undefined     | collection of params to pass along with the upload
| forceJsonResponse    | boolean       | false         | parse server response as JSON even if no JSON content-type header received            
| withCredentials      | boolean       | false         | set XHR withCredentials to true
| enhancer             | [UploaderEnhancer](../../uploader/src/types.js#L37) | undefined    | uploader [enhancer](../../../README.md#enhancer) function
| concurrent           | boolean       | false          | issue multiple upload requests simultaneously
| maxConcurrent        | number        | 2              | maximum allowed simultaneous requests
| send                 | [SendMethod](../../shared/src/types.js#L100) | @rpldy/sender | how to send files to the server


## Uploader API

### add

_(files: UploadInfo | UploadInfo[], options?: ?UploadOptions) => void_

The way to add file(s) to be uploaded. Second parameters allows to pass different options than
the ones the instance currently uses for this specific batch. These options will be merged with current instance options.
 
### upload: 

_() => void_

For batches that were added with autoUpload = false, the upload method must be called for the files to begin uploading.

### abort

_(id?: string) => void_

abort all files being uploaded or a single item by its ID
   
### abortBatch

_(id: string) => void_

abort a specific batch by its ID

### update
 
_(options: UploadOptions) => UploaderType_

options parameter will be merged with the instance's existing options
Returns the uploader instance

###	getOptions

_() => CreateOptions_

get the instance's upload options

###	getPending

_() => [PendingBatch[]](src/types.js#L15)_

get pending batches that were added with autoUpload = false.

###	clearPending

_() => void_

remove all batches that were added with autoUpload = false 
and were not sent to upload yet.

### on 

_[OnAndOnceMethod](../life-events/src/types.js#29)_

register an event handler

### once 

_[OnAndOnceMethod](../life-events/src/types.js#29)_

register an event handler that will be called only once

### off
_[OffMethod](../life-events/src/types.js#27)_

unregister an existing event handler
    
### registerExtension

_(name: any, Object) => void_

Extensions can only be registered by enhancers.
If registerExtension is called outside an enhancer, an error will be thrown
Name must be unique. If not, an error will be thrown

### getExtension
 
_(name: any) => ?Object__

Retrieve a registered extension by its name

## Events

The Uploader will trigger for batch and batch-item lifecycle events.

Registering to handle events can be done using the uploader's on() and once() methods.
Unregistering can be done using off() or by the return value of both on and once.

```javascript
const batchAddHandler = (batch) => {};

const unregister = uploader.on(UPLOADER_EVENTS.BATCH_ADD, batchAddHandler);

unregister(); //is equivalent to the line below
uploader.off(UPLOADER_EVENTS.BATCH_ADD, batchAddHandler);
```

### UPLOADER_EVENTS.BATCH_ADD

Triggered when a new batch is added.

> This event is _[cancellable](#cancellable-events)_

### UPLOADER_EVENTS.BATCH_START

Triggered when batch items start uploading

> This event is _[cancellable](#cancellable-events)_

### UPLOADER_EVENTS.BATCH_PROGRESS

Triggered every time progress data is received from the upload request(s)

### UPLOADER_EVENTS.BATCH_FINISH

Triggered when batch items finished uploading
 
### UPLOADER_EVENTS.BATCH_CANCEL

Triggered in case batch was cancelled from BATCH_START event handler

### UPLOADER_EVENTS.BATCH_ABORT

Triggered in case the batch was [aborted](#abortBatch)

### UPLOADER_EVENTS.ITEM_START

Triggered when item starts uploading (just before)

### UPLOADER_EVENTS.ITEM_FINISH

Triggered when item finished uploading

The server response can be accessed through the item's uploadResponse property.

### UPLOADER_EVENTS.ITEM_PROGRESS

Triggered every time progress data is received for this file upload

### UPLOADER_EVENTS.ITEM_CANCEL

Triggered in case item was cancelled from [ITEM_START](#UPLOADER_EVENTS.ITEM_START) event handler

### UPLOADER_EVENTS.ITEM_ERROR

Triggered in case item upload failed

The server response can be accessed through the item's uploadResponse property.

### UPLOADER_EVENTS.ITEM_ABORT
    
Triggered in case [abort](#abort) was called

### UPLOADER_EVENTS.REQUEST_PRE_SEND

Triggered before a group of items is going to be uploaded
Group will contain a single item unless "grouped" option is set to true.

Handler receives the item(s) in the group and the upload options that were used.
The handler can change data inside the items and in the options by returning different data than received.
See this [guide](../../guides/DynamicParameters.md) for more details.

## Cancellable Events

These are events that allow the client to cancel their respective upload object (batch or batch item)
To cancel the upload, the handler can return false.

```javascript
uploader.on(UPLOADER_EVENTS.ITEM_START, (item) => {
    let result;
    
    if (item.file.name.endsWith(".xml")) {
        result = false; //only false will cause a cancel.
    }

    return result;
});
```