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

@property (nonatomic, readonly) UIWebView *webView;

@property (nonatomic) BOOL webArchiveRequired;

- (void)loadRequest:(NSURLRequest *)urlRequest;

- (void)loadRequesetInNewController:(NSURLRequest*)urlRequest;

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
