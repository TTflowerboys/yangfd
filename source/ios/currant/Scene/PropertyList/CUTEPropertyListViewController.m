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
#import <BBTJSON.h>
#import <MKMapView+BBT.h>
#import <AddressBook/AddressBook.h>
#import "CUTEMapView.h"
#import <SMCalloutView.h>
#import "CUTEConfiguration.h"
#import "NSURL+CUTE.h"
#import "CUTECommonMacro.h"
#import "CUTETracker.h"
#import "MasonryMake.h"
#import "CUTENotificationKey.h"
#import "CUTEAPIManager.h"
#import "CUTEProperty.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "NSObject+Attachment.h"
#import "NSArray+ObjectiveSugar.h"
#import "CUTEHouseType.h"

@interface CUTEPropertyListViewController () <MKMapViewDelegate, SMCalloutViewDelegate>
{
    CUTEMapView *_mapView;

    BOOL _mapShowing;

    UIButton *_mapButton;
}

@end


@implementation CUTEPropertyListViewController


- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];

    //TODO check process of view
    //back from other controller, need update the constraints
    [self updateCustomViewConstraints];
}

- (void)updateCustomViewConstraints {

    if ([_mapButton.attachment isEqualToString:@"ShowList"]) {

        if ([self.view isDescendantOfView:self.navigationController.view]) {
            UpdateBegin(self.view)
            MakeEdgesEqualTo(self.navigationController.view);
            UpdateEnd
        }

        if ([_mapView isDescendantOfView:self.view]) {
            UpdateBegin(_mapView)
            MakeEdgesEqualTo(self.view);
            UpdateEnd
        }


        UpdateBegin(_mapButton)
        MakeRighEqualTo(self.view.right).offset(-12);
        MakeBottomEqualTo(self.view.bottom).offset(-40 - TabBarHeight);
        UpdateEnd

    }
    else {

        if ([self.view isDescendantOfView:self.navigationController.view]) {
            UpdateBegin(self.view)
            MakeTopEqualTo(self.navigationController.view.top).offset(TouchHeightDefault + StatusBarHeight);
            MakeLeftEqualTo(self.navigationController.view.left);
            MakeRighEqualTo(self.navigationController.view.right);
            MakeBottomEqualTo(self.navigationController.view.bottom).offset(- TabBarHeight);
            UpdateEnd
        }

        if ([self.webView isDescendantOfView:self.view]) {
            UpdateBegin(self.webView)
            MakeEdgesEqualTo(self.view);
            UpdateEnd
        }

        UpdateBegin(_mapButton)
        MakeRighEqualTo(self.view.right).offset(-12);
        MakeBottomEqualTo(self.view.bottom).offset(-40);
        UpdateEnd


    }
}

- (void)flipMapViewAnimated:(BOOL)animated completion:(void (^)(BOOL finished))completion  {
    CGFloat duration = animated? 0.3: 0;
    if ([_mapButton.attachment isEqualToString:@"ShowMap"]) {
        if (!_mapView) {
            _mapView = [[CUTEMapView alloc] initWithFrame:self.view.bounds];
            _mapView.delegate = self;

            SMCalloutView *calloutView = [[SMCalloutView alloc] init];
            calloutView.delegate = self;
            _mapView.calloutView = calloutView;
        }
        [[self navigationController] setNavigationBarHidden:YES animated:YES];
        [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_HIDE_ROOT_TAB_BAR object:nil];

        [UIView transitionWithView:self.view
                          duration:duration
                           options:UIViewAnimationOptionTransitionFlipFromRight
                        animations:^{
                            [self.webView removeFromSuperview];
                            [self.view addSubview:_mapView];
                        }
                        completion:^(BOOL finished) {

                            [self clearBackButton];
                            [_mapButton setImage:IMAGE(@"button-selector-list") forState:UIControlStateNormal];
                            _mapButton.attachment = @"ShowList";
                            [self updateCustomViewConstraints];
                            [self loadMapData];
                            if (completion) {
                                completion(finished);
                            }

                        }];

    }
    else {
        [[self navigationController] setNavigationBarHidden:NO animated:YES];
        [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_SHOW_ROOT_TAB_BAR object:nil];

        [UIView transitionWithView:self.view
                          duration:duration
                           options:UIViewAnimationOptionTransitionFlipFromLeft
                        animations:^{
                            [_mapView removeFromSuperview];
                            [self.view addSubview:self.webView];
                        }
                        completion:^(BOOL finished) {
                            [self updateBackButton];
                            [_mapButton setImage:IMAGE(@"button-selector-map") forState:UIControlStateNormal];
                            _mapButton.attachment = @"ShowMap";
                            [self updateCustomViewConstraints];
                            if (completion) {
                                completion(finished);
                            }
                        }];
    }

    [self.view bringSubviewToFront:_mapButton];
}

- (void)onMapButtonPressed:(id)sender {
    [self flipMapViewAnimated:YES completion:nil];
}

- (void)loadMapData {
    if (!IsArrayNilOrEmpty(_mapView.annotations)) {
        [_mapView removeAnnotations:_mapView.annotations];
    }

    NSString *rawParams = [self.webView stringByEvaluatingJavaScriptFromString:@"JSON.stringify(window.getBaseRequestParams())"];
    NSMutableDictionary *params = [NSMutableDictionary dictionaryWithDictionary:[rawParams JSONObject]];
    [params setObject:@(1) forKey:@"location_only"];

    [[[CUTEAPIManager sharedInstance] POST:@"/api/1/property/search" parameters:params resultClass:[CUTEProperty class] resultKeyPath:@"val.content"] continueWithBlock:^id(BFTask *task) {
        if (task.error) {
            [SVProgressHUD showErrorWithError:task.error];
        }
        else if (task.exception) {
            [SVProgressHUD showErrorWithException:task.exception];
        }
        else if (task.isCancelled) {
            [SVProgressHUD showErrorWithCancellation];
        }
        else {
            NSArray *propertyList = task.result;
            NSMutableArray *locations = [NSMutableArray arrayWithCapacity:propertyList.count];
            NSMutableArray *annotations = [NSMutableArray arrayWithCapacity:propertyList.count];
            for (CUTEProperty *property in propertyList) {
                CLLocation *location = [[CLLocation alloc] initWithLatitude:property.latitude longitude:property.longitude];
                [locations addObject:location];
                MKPlacemark *placemark = [[MKPlacemark alloc] initWithCoordinate:CLLocationCoordinate2DMake(property.latitude, property.longitude) addressDictionary:nil];
                placemark.attachment = property;
                [annotations addObject:placemark];
            }
            [_mapView addAnnotations:annotations];
            [_mapView zoomToFitMapLocationsInsideArray:locations];

        }

        return task;
    }];


   }

- (void)updateMapButtonWithURL:(NSURL *)url {
    if ([url.path hasPrefix:self.url.path]) {

        if (!_mapButton) {
            _mapButton = [UIButton buttonWithType:UIButtonTypeCustom];
            [_mapButton setImage:IMAGE(@"button-selector-map") forState:UIControlStateNormal];
            _mapButton.attachment = @"ShowMap";
            [_mapButton addTarget:self action:@selector(onMapButtonPressed:) forControlEvents:UIControlEventTouchUpInside];
            [self.view addSubview:_mapButton];
            MakeBegin(_mapButton)
            MakeRighEqualTo(self.view.right).offset(-12);
            MakeBottomEqualTo(self.view.bottom).offset(-40);
            MakeEnd
        }

        [self.view bringSubviewToFront:_mapButton];
        [_mapButton setHidden:NO];
    }
    else {
        [_mapButton setHidden:YES];
    }
}

- (NSString *)formatPrice:(CGFloat)price symbol:(NSString *)symbol {
    NSString *suffix = @"";
    if  (price > 100000000) {
        price = price / 100000000;
        suffix = STR(@"亿");
    }
    else if (price > 10000) {
        price = price / 10000;
        suffix = STR(@"万");
    }
    NSNumberFormatter *numberFormatter = [[NSNumberFormatter alloc] init];
    [numberFormatter setFormatterBehavior:NSNumberFormatterBehavior10_4];
    [numberFormatter setNumberStyle:NSNumberFormatterCurrencyStyle];
    [numberFormatter setCurrencySymbol:symbol];
    [numberFormatter setMaximumFractionDigits:2];
    NSNumber *c = [NSNumber numberWithFloat:price];
    return CONCAT([numberFormatter stringFromNumber:c], suffix);
}

- (NSString *)getPriceFromProperty:(CUTEProperty *)property {
    if (property.propertyType && [@[@"new_property", @"student_housing"] containsObject:property.propertyType.slug]) {
        CUTEHouseType *houseType = [[property.mainHouseTypes  sortBy:@"totalPriceMin.value"] firstObject];
        return CONCAT([self formatPrice:houseType.totalPriceMin.value symbol:houseType.totalPriceMin.symbol], STR(@"起"));
    }

    return @"";
}

- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType
{
    [self updateMapButtonWithURL:webView.request.URL];
    return [super webView:webView shouldStartLoadWithRequest:request navigationType:navigationType];
}

- (void)webViewDidFinishLoad:(UIWebView *)webView {
    [super webViewDidFinishLoad:webView];
    [self updateMapButtonWithURL:webView.request.URL];
}

- (MKAnnotationView *)mapView:(MKMapView *)mapView viewForAnnotation:(id <MKAnnotation>)annotation
{
    MKAnnotationView *view = [mapView dequeueReusableAnnotationViewWithIdentifier:@"annotation"];
    if (!view) {
        view = [[MKAnnotationView alloc] initWithAnnotation:annotation reuseIdentifier:@"annotation"];
        //view.canShowCallout = YES;
    }
    view.annotation = annotation;
    view.image = IMAGE(@"icon-location-building");
    return view;
}

- (void)showCalloutView:(CUTEProperty *)property inView:(UIView *)view {
    _mapView.calloutView.title = property.name;
    UILabel *subtitleLabel = [[UILabel alloc] init];
    subtitleLabel.opaque = NO;
    subtitleLabel.backgroundColor = [UIColor clearColor];
    subtitleLabel.font = [UIFont systemFontOfSize:12];
    subtitleLabel.textColor = [UIColor blackColor];
    subtitleLabel.frame = CGRectMake(0, 28, 140, 15);
    NSMutableAttributedString *attriString = [[NSMutableAttributedString alloc] initWithString:property.propertyType.value];
    [attriString appendAttributedString:[[NSAttributedString alloc] initWithString:@" "]]; // add space before price
    [attriString appendAttributedString:[[NSAttributedString alloc] initWithString:[self getPriceFromProperty:property] attributes:@{NSForegroundColorAttributeName : HEXCOLOR(0xe60012, 1)}]];
    subtitleLabel.attributedText = attriString;
    _mapView.calloutView.subtitleView = subtitleLabel;
    _mapView.calloutView.rightAccessoryView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"icon-accessory"]];
    _mapView.calloutView.attachment = property;
    [_mapView.calloutView presentCalloutFromRect:view.bounds inView:view constrainedToView:_mapView animated:YES];

}

- (void)mapView:(MKMapView *)mapView didSelectAnnotationView:(MKAnnotationView *)view {
    if (_mapView.calloutView.window) {
        [_mapView.calloutView dismissCalloutAnimated:NO];
    }

    if ([view.annotation isKindOfClass:[MKPlacemark class]]) {

        CUTEProperty *property = [(MKPlacemark *)view.annotation attachment];
        if (!IsNilNullOrEmpty(property.name) && property.propertyType) {
            [self showCalloutView:property inView:view];
        }
        else {
            [[[CUTEAPIManager sharedInstance] GET:CONCAT(@"/api/1/property/", property.identifier) parameters:nil resultClass:[CUTEProperty class]] continueWithBlock:^id(BFTask *task) {
                if (task.error) {
                    [SVProgressHUD showErrorWithError:task.error];
                }
                else if (task.exception) {
                    [SVProgressHUD showErrorWithException:task.exception];
                }
                else if (task.isCancelled) {
                    [SVProgressHUD showErrorWithCancellation];
                }
                else {
                    [(MKPlacemark *)view.annotation setAttachment:task.result];
                    [self showCalloutView:task.result inView:view];
                }
                return task;
            }];
        }
    }
}

- (void)calloutViewClicked:(SMCalloutView *)calloutView {
    CUTEProperty *property = calloutView.attachment;
    NSURL *url = [NSURL WebURLWithString:CONCAT(@"/property/", property.identifier)];

    [[self navigationController] setNavigationBarHidden:NO animated:NO];
    [self loadURLInNewController:url];
}

@end
