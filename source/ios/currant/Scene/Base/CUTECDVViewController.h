//
//  CUTECDVViewController.h
//  currant
//
//  Created by Foster Yin on 9/5/15.
//  Copyright © 2015 Foster Yin. All rights reserved.
//

/**
 * Custom pub-sub "channel" that can have functions subscribed to it
 * This object is used to define and control firing of events for
 * cordova initialization, as well as for custom events thereafter.
 *
 * The order of events during page load and Cordova startup is as follows:
 *
 * onDOMContentLoaded*         Internal event that is received when the web page is loaded and parsed.
 * onNativeReady*              Internal event that indicates the Cordova native side is ready.
 * onCordovaReady*             Internal event fired when all Cordova JavaScript objects have been created.
 * onDeviceReady*              User event fired to indicate that Cordova is ready
 * onResume                    User event fired to indicate a start/resume lifecycle event
 * onPause                     User event fired to indicate a pause lifecycle event
 *
 * The events marked with an * are sticky. Once they have fired, they will stay in the fired state.
 * All listeners that subscribe after the event is fired will be executed right away.
 *
 * The only Cordova events that user code should register for are:
 *      deviceready           Cordova native code is initialized and Cordova APIs can be called from JavaScript
 *      pause                 App has moved to background
 *      resume                App has returned to foreground
 *
 * Listeners can be registered as:
 *      document.addEventListener("deviceready", myDeviceReadyListener, false);
 *      document.addEventListener("resume", myResumeListener, false);
 *      document.addEventListener("pause", myPauseListener, false);
 *
 * The DOM lifecycle events should be used for saving and restoring state
 *      window.onload
 *      window.onunload
 *
 */


#import "CDVViewController.h"
#import "CUTEWebArchiveManager.h"

@interface CUTECDVViewController : CDVViewController

@property (strong, nonatomic) CUTEWebArchive *webArchive;


- (void)updateBackButton;

- (void)clearBackButton;

- (BOOL)webViewCanGoBack;

- (BOOL)viewControllerCanGoBack;

- (void)reload;

- (void)loadRequest:(NSURLRequest *)urlRequest;

- (void)loadRequesetInNewController:(NSURLRequest*)urlRequest;

- (void)loadWebArchive:(CUTEWebArchive *)archive;

@end
