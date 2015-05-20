//
//  CUTEWebViewController.h
//  currant
//
//  Created by Foster Yin on 3/21/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "CUTEViewController.h"

@interface CUTEWebViewController : CUTEViewController <UIWebViewDelegate>

@property (nonatomic, readonly) UIWebView *webView;

- (void)loadURL:(NSURL *)url;

- (void)loadURLInNewController:(NSURL*)url;

- (void)updateWithURL:(NSURL *)url;

- (void)updateTitleWithURL:(NSURL *)url;

- (void)updateRightButtonWithURL:(NSURL *)url;

- (void)updateBackButton;

- (void)clearBackButton;

@end
