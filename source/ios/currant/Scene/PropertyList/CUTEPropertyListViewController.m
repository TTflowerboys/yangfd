//
//  CUTEPropertyListViewController.m
//  currant
//
//  Created by Foster Yin on 3/25/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEPropertyListViewController.h"
#import <MapKit/MapKit.h>
#import <NSObject+Attachment.h>

@interface CUTEPropertyListViewController ()
{
    MKMapView *_mapView;

    BOOL _mapShowing;

    UIButton *_mapButton;
}

@end


@implementation CUTEPropertyListViewController

- (void)loadURLPath:(NSString *)urlPath {
    [super loadURLPath:urlPath];

    if (!_mapButton) {
        _mapButton = [UIButton buttonWithType:UIButtonTypeCustom];
        [_mapButton setImage:IMAGE(@"button-selector-map") forState:UIControlStateNormal];
        _mapButton.frame = CGRectMake(ScreenWidth - 50, ScreenHeight - 50 - 50, 40, 40);
        _mapButton.attachment = @"ShowMap";
        [_mapButton addTarget:self action:@selector(onMapButtonPressed:) forControlEvents:UIControlEventTouchUpInside];
        [self.view addSubview:_mapButton];
    }
    [self.view bringSubviewToFront:_mapButton];
}

- (void)onMapButtonPressed:(id)sender {
    if ([_mapButton.attachment isEqualToString:@"ShowMap"]) {
        if (!_mapView) {
            _mapView = [[MKMapView alloc] initWithFrame:self.view.bounds];
        }
        [UIView transitionFromView:self.webView toView:_mapView duration:0.2 options:UIViewAnimationOptionTransitionFlipFromRight
                        completion:^(BOOL finished) {
                            self.webView.hidden = YES;
                            _mapView.hidden = NO;
                            [self clearBackButton];

                            [_mapButton setImage:IMAGE(@"button-selector-list") forState:UIControlStateNormal];
                            _mapButton.attachment = @"ShowList";
                        }];
    }
    else {
        [UIView transitionFromView:_mapView toView:self.webView duration:0.2 options:UIViewAnimationOptionTransitionFlipFromLeft
                        completion:^(BOOL finished) {
                            self.webView.hidden = NO;
                            _mapView.hidden = YES;
                            [self updateBackButton];
                            [_mapButton setImage:IMAGE(@"button-selector-map") forState:UIControlStateNormal];
                            _mapButton.attachment = @"ShowMap";
        }];
    }

    [self.view bringSubviewToFront:_mapButton];
}

@end
