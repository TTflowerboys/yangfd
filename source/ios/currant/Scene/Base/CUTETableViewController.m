//
//  CUTETableViewController.m
//  currant
//
//  Created by Foster Yin on 11/13/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

#import "CUTETableViewController.h"

@interface CUTETableViewController ()
{
    BFCancellationTokenSourceCollector *_asyncTaskCollector;
}

@end

@implementation CUTETableViewController

- (BFCancellationTokenSourceCollector *)asyncTaskCollector {
    if (_asyncTaskCollector == nil) {
        _asyncTaskCollector = [BFCancellationTokenSourceCollector collector];
    }
    return _asyncTaskCollector;
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    [_asyncTaskCollector cancelAllCancellationTokenSource];
}

@end
