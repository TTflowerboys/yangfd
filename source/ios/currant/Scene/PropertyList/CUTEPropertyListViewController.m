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


@interface CUTEPropertyListViewController () <MKMapViewDelegate, SMCalloutViewDelegate>
{
    CUTEMapView *_mapView;

    BOOL _mapShowing;

    UIButton *_mapButton;
}

@end


@implementation CUTEPropertyListViewController

- (void)loadURL:(NSURL *)url {
    [super loadURL:url];

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

- (void)flipMapViewAnimated:(BOOL)animated completion:(void (^)(BOOL finished))completion  {
    CGFloat duration = animated? 0.2: 0;
    if ([_mapButton.attachment isEqualToString:@"ShowMap"]) {
        if (!_mapView) {
            _mapView = [[CUTEMapView alloc] initWithFrame:TabBarControllerViewFrame];
            _mapView.delegate = self;
            SMCalloutView *calloutView = [[SMCalloutView alloc] init];
            calloutView.delegate = self;
            _mapView.calloutView = calloutView;
        }
        [UIView transitionFromView:self.webView toView:_mapView duration:duration options:UIViewAnimationOptionTransitionFlipFromRight
                        completion:^(BOOL finished) {
                            self.webView.hidden = YES;
                            _mapView.hidden = NO;
                            [self clearBackButton];
                            [_mapButton setImage:IMAGE(@"button-selector-list") forState:UIControlStateNormal];
                            _mapButton.attachment = @"ShowList";
                            [self loadMapData];
                            if (completion) {
                                completion(finished);
                            }
                        }];
    }
    else {
        [UIView transitionFromView:_mapView toView:self.webView duration:duration options:UIViewAnimationOptionTransitionFlipFromLeft
                        completion:^(BOOL finished) {
                            self.webView.hidden = NO;
                            _mapView.hidden = YES;
                            [self updateBackButton];
                            [_mapButton setImage:IMAGE(@"button-selector-map") forState:UIControlStateNormal];
                            _mapButton.attachment = @"ShowMap";
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

    NSString *rawPropertyList = [self.webView stringByEvaluatingJavaScriptFromString:@"JSON.stringify(propertyList)"];
    NSArray *propertyList = [rawPropertyList JSONObject];

    NSMutableArray *locations = [NSMutableArray arrayWithCapacity:propertyList.count];
    NSMutableArray *annotations = [NSMutableArray arrayWithCapacity:propertyList.count];
    _.arrayEach(propertyList, ^(NSDictionary *property) {
        CLLocation *location = [[CLLocation alloc] initWithLatitude:[property[@"latitude"] doubleValue] longitude:[property[@"longitude"] doubleValue]];
        [locations addObject:location];
        MKPlacemark *placemark = [[MKPlacemark alloc] initWithCoordinate:CLLocationCoordinate2DMake([property[@"latitude"] doubleValue], [property[@"longitude"] doubleValue]) addressDictionary:nil];
        placemark.attachment = property;
        [annotations addObject:placemark];
    });
    [_mapView addAnnotations:annotations];
    [_mapView zoomToFitMapLocationsInsideArray:locations];
}

- (void)updateMapButtonWithURL:(NSURL *)url {
    if ([_mapButton.attachment isEqualToString:@"ShowMap"] && [url.path hasPrefix:self.url.path]) {
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

- (NSString *)getPriceFromProperty:(NSDictionary *)property {
    if (property[@"property_type"] && ([property[@"property_type"][@"slug"] isEqualToString:@"new_property"] || [property[@"property_type"][@"slug"] isEqualToString:@"student_housing"])) {
        CGFloat minPrice = [(NSString *)(property[@"main_house_types"][0][@"total_price_min"][@"value"]) floatValue];
        for (NSDictionary *houseType in property[@"main_house_types"]) {
            CGFloat price = [(NSString *)(houseType[@"total_price_min"][@"value"]) floatValue];
            if (minPrice > price) {
                minPrice = price;
            }
        }

        return CONCAT([self formatPrice:minPrice symbol:property[@"main_house_types"][0][@"total_price_min"][@"unit_symbol"]], STR(@"起"));

    }
    else if (property[@"unit_price"]){
        return CONCAT([self formatPrice:[property[@"unit_price"][@"value"] floatValue] symbol:property[@"unit_price"][@"unit_symbol"]], @"/", property[@"unit_price"][@"unit"][@"unit"]);
    }
    else {
        return CONCAT([self formatPrice:[property[@"total_price"][@"value"] floatValue] symbol:property[@"total_price"][@"unit_symbol"]]);
    }
}

- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType
{
    [self updateMapButtonWithURL:request.URL];
    return [super webView:webView shouldStartLoadWithRequest:request navigationType:navigationType];
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

- (void)mapView:(MKMapView *)mapView didSelectAnnotationView:(MKAnnotationView *)view {
    if (_mapView.calloutView.window) {
        [_mapView.calloutView dismissCalloutAnimated:NO];
    }
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        if ([view.annotation isKindOfClass:[MKPlacemark class]]) {
            NSDictionary *property = [(MKPlacemark *)view.annotation attachment];
            _mapView.calloutView.title = property[@"name"];
            UILabel *subtitleLabel = [[UILabel alloc] init];
            subtitleLabel.opaque = NO;
            subtitleLabel.backgroundColor = [UIColor clearColor];
            subtitleLabel.font = [UIFont systemFontOfSize:12];
            subtitleLabel.textColor = [UIColor blackColor];
            subtitleLabel.frame = CGRectMake(0, 28, 140, 15);
            NSMutableAttributedString *attriString = [[NSMutableAttributedString alloc] initWithString:property[@"property_type"][@"value"]];
            [attriString appendAttributedString:[[NSAttributedString alloc] initWithString:@" "]]; // add space before price
            [attriString appendAttributedString:[[NSAttributedString alloc] initWithString:[self getPriceFromProperty:property] attributes:@{NSForegroundColorAttributeName : HEXCOLOR(0xe60012, 1)}]];
            subtitleLabel.attributedText = attriString;
            _mapView.calloutView.subtitleView = subtitleLabel;
            _mapView.calloutView.rightAccessoryView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"icon-accessory"]];
            _mapView.calloutView.attachment = property;
            [_mapView.calloutView presentCalloutFromRect:view.bounds inView:view constrainedToView:_mapView animated:YES];
        }
    });
}

- (void)calloutViewClicked:(SMCalloutView *)calloutView {
    [self flipMapViewAnimated:YES completion:^(BOOL finished) {
        NSDictionary *property = calloutView.attachment;
        [self loadURL:[NSURL WebURLWithString:CONCAT(@"/property/", property[@"id"])]];
    }];
}

@end
