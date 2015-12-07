//
//  CUTEWebViewController.h
//  currant
//
//  Created by Foster Yin on 3/21/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "CUTEViewController.h"
#import "CUTEWebArchiveManager.h"

@interface CUTEWebViewController : CUTEViewController <UIWebViewDelegate>

//TODO refine the url
@property (strong, nonatomic) NSURL *URL;

//If user need login the url is the redirected url, the originalURL is the origianl url, else is the url
@property (nonatomic, readonly) NSURL *originalURL;

@property (nonatomic, readonly) UIWebView *webView;

@property (nonatomic) BOOL webArchiveRequired;

@property (nonatomic) BOOL disableUpdateBackButton;

- (void)loadRequest:(NSURLRequest *)urlRequest;

- (void)loadWebArchive:(CUTEWebArchive *)archive;

- (void)updateWithURL:(NSURL *)url;

- (void)updateTitleWithURL:(NSURL *)url;

- (void)updateRightButtonWithURL:(NSURL *)url;

- (void)updateBackButton;

- (void)clearBackButton;

- (BOOL)webViewCanGoBack;

- (BOOL)viewControllerCanGoBack;

- (void)reload;

@end
