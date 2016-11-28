//
//  CUTESurroundingSearchViewController.swift
//  currant
//
//  Created by Foster Yin on 12/1/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

protocol CUTESurroundingSearchDelegate : NSObjectProtocol {

    func searchAddSurrounding(_ surrounding:CUTESurrounding)

}

@objc(CUTESurroundingSearchViewController)
class CUTESurroundingSearchViewController: UIViewController, UITableViewDataSource, UITableViewDelegate, UISearchBarDelegate {

    var searchBar:UISearchBar!
    weak var tableView:UITableView!
    var delegate:CUTESurroundingSearchDelegate?

    // MARK - Private Var
    var form:CUTESurroundingForm
    var searchResultSurroundings:[CUTESurrounding] = []
    var postcodeIndex:String
    var searchCancellationTokenSource:BFCancellationTokenSource?
    var test:String?

    // 实现隐藏“No Results” label 用的flag
    //http://stackoverflow.com/questions/11639257/how-do-i-cover-the-no-results-text-in-uisearchdisplaycontrollers-searchresult
    //http://stackoverflow.com/questions/22888016/uisearchdisplaycontroller-configure-no-results-view-not-to-overlap-tablefooter
    fileprivate var noSearchResult:Bool = true


    init(form:CUTESurroundingForm, postcodeIndex:String!) {
        self.form = form
        self.postcodeIndex = postcodeIndex
        super.init(nibName:nil, bundle:nil)
    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }


    override func loadView() {
        let size = UIScreen.main.bounds.size
        self.view = UIView(frame: CGRect(x: 0, y: 0, width: size.width, height: size.height))

        let searchBar = UISearchBar(frame: CGRect(x: 0, y: 20, width: size.width, height: 44))
        searchBar.backgroundImage = UIImage()
        searchBar.tintColor = UIColor(hex6: 0xdd3f3d)
        searchBar.barTintColor = UIColor.clear
        searchBar.backgroundColor = UIColor.clear
        searchBar.delegate = self
        searchBar.placeholder = STR("SurroundingList/输入关键字搜索学校, 地铁...")
        self.searchBar = searchBar

        let tableView = UITableView(frame: CGRect(x: 0, y: 0, width: size.width, height: size.height), style: UITableViewStyle.plain)
        tableView.delegate = self
        tableView.dataSource = self
        self.view.addSubview(tableView)
        
        self.tableView = tableView
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        self.navigationItem.titleView = self.searchBar
        self.navigationItem.rightBarButtonItem = UIBarButtonItem(title: STR("取消"), style: UIBarButtonItemStyle.plain, block: { (sender:Any!) -> Void in

            if self.searchCancellationTokenSource != nil {
                self.searchCancellationTokenSource!.cancel()
            }

            self.searchBar.resignFirstResponder()
            self.dismiss(animated: true, completion: { () -> Void in

            })
        })

        // Do any additional setup after loading the view.
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)

        //http://stackoverflow.com/questions/9357026/super-slow-lag-delay-on-initial-keyboard-animation-of-uitextfield
        DispatchQueue.main.async { () -> Void in
            self.searchBar.becomeFirstResponder()
        }
    }

    override var preferredStatusBarStyle : UIStatusBarStyle {
        return UIStatusBarStyle.lightContent
    }

    // MARK: - Table view data source

    func numberOfSections(in tableView: UITableView) -> Int {
        // #warning Incomplete implementation, return the number of sections
        return 1
    }

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if self.searchResultSurroundings.count == 0 {
            noSearchResult = true
            return 1
        }
        else {
            noSearchResult = false
            return self.searchResultSurroundings.count
        }
    }


    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {

        if noSearchResult == true {
            var cell = tableView.dequeueReusableCell(withIdentifier: "cleanCell")
            if cell == nil {
                cell = UITableViewCell(style: UITableViewCellStyle.default, reuseIdentifier: "reuseIdentifier")
                cell?.textLabel?.font = UIFont.systemFont(ofSize: 15)
                cell?.textLabel?.textColor = UIColor(hex6: 0x666666)
                cell?.removeMargins()
            }
            return cell!
        }
        else {
            var cell = tableView.dequeueReusableCell(withIdentifier: "reuseIdentifier")
            if cell == nil {
                cell = UITableViewCell(style: UITableViewCellStyle.default, reuseIdentifier: "reuseIdentifier")
                cell?.textLabel?.font = UIFont.systemFont(ofSize: 15)
                cell?.textLabel?.textColor = UIColor(hex6: 0x666666)
                cell?.removeMargins()
            }
            let surrounding = self.searchResultSurroundings[indexPath.row]
            let imageView = UIImageView()
            imageView.frame = CGRect(x: 0, y: 0, width: 20, height: 20)
            imageView.contentMode = UIViewContentMode.center
            if let type = surrounding.type {
                if let image = type.image {
                    if let url = URL(string: image) {
                        imageView.setImageWith(url)
                    }
                }
            }
            cell?.accessoryView = imageView
            cell?.textLabel?.numberOfLines = 2
            cell?.textLabel?.lineBreakMode = NSLineBreakMode.byWordWrapping
            cell?.textLabel?.text = surrounding.name
            return cell!
        }
    }

    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return 65
    }

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        if self.searchResultSurroundings.count > 0{
            let surrounding = self.searchResultSurroundings[indexPath.row]
            let surroundings = form.ticket.property.surroundings as! [CUTESurrounding]
            if  surroundings.filter({ (surr:CUTESurrounding) -> Bool in
                return surr.identifier == surrounding.identifier
            }).count == 0 {

                self.searchBar.resignFirstResponder()

                self.navigationController?.dismiss(animated: true, completion: { () -> Void in
                    if let delegate = self.delegate {
                        delegate.searchAddSurrounding(surrounding)
                    }
                })
            }
            else {
                tableView.deselectRow(at: indexPath, animated: true)
                SVProgressHUD.showError(withStatus: STR("SurroundingList/已添加"))
            }
        }
        else {
            tableView.deselectRow(at: indexPath, animated: true)
        }
    }

    func scrollViewWillBeginDragging(_ scrollView: UIScrollView) {
        //dismiss keyboard
        self.searchBar.resignFirstResponder()
    }

    func searchBarSearchButtonClicked(_ searchBar: UISearchBar) {
        if self.searchCancellationTokenSource != nil {
            self.searchCancellationTokenSource!.cancel()
        }
        SVProgressHUD.show()
        self.searchCancellationTokenSource = BFCancellationTokenSource()
        CUTEGeoManager.sharedInstance.searchSurroundingsMainInfoWithName(searchBar.text, latitude: nil, longitude: nil, city: nil, country: nil, propertyPostcodeIndex:self.postcodeIndex, cancellationToken:self.searchCancellationTokenSource!.token).continue({ (task:BFTask!) -> AnyObject! in
            self.searchCancellationTokenSource = nil

            if task.error != nil {
                SVProgressHUD.showErrorWithError(task.error)
            }
            else if task.isCancelled {
                SVProgressHUD.showErrorWithCancellation()
            }
//            else if task.exception != nil {
//                SVProgressHUD.showError(with: task.exception)
//            }
            else if let surroundings = task.result as? [CUTESurrounding] {
                self.searchResultSurroundings = surroundings
                self.tableView.reloadData()
                SVProgressHUD.dismiss()
            }
            return task
        })
    }



    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
